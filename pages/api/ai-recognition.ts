import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import type { File as FormidableFile } from 'formidable';
import fs from 'fs';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false, // we use formidable to parse multipart/form-data
  },
};

type AnalysisResult = {
  title?: string | null;
  author?: string | null;
  year?: string | null;
  movement?: string | null;
  technique?: string | null;
  dimensions?: string | null;
  location?: string | null;
  description?: string | null;
  characters?: { name: string; role: string }[] | null;
  image_url?: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  // parse multipart/form-data with formidable (modern API)
  const form = formidable({ multiples: true });

  try {
    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const fileField = (files.image as any) ?? (files.file as any);
    if (!fileField) return res.status(400).json({ error: 'No image file uploaded (field name: image)' });

    let file: FormidableFile | undefined;
    if (Array.isArray(fileField)) {
      file = fileField[0] as FormidableFile;
    } else {
      file = fileField as FormidableFile;
    }

    if (!file) return res.status(400).json({ error: 'No image file uploaded' });

    const filepath = (file as any).filepath || (file as any).path;
    const buffer = fs.readFileSync(filepath);
    const filename = (file as any).originalFilename || (file as any).newFilename || (file as any).name || 'uploaded';
    const imageHash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 8);
    const detected = (file as any).mimetype || detectMimeType(buffer) || '';
    console.log('Received image', { filename, detected, size: buffer.length, hash: imageHash });

    // Basic validations to protect OpenAI usage and avoid huge prompts
    const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED_MIMES.includes(detected)) {
      return res.status(400).json({ error: 'Unsupported image type. Use JPG, PNG, WEBP or GIF.' });
    }

    const MAX_BYTES = 300 * 1024; // 300 KB limit for image payload sent to OpenAI
    if (buffer.length > MAX_BYTES) {
      return res.status(413).json({
        error: 'Image too large for analysis',
        imageSizeBytes: buffer.length,
        suggestion: 'Please compress the image client-side (try under 300KB) before uploading. The app attempts to compress automatically; reduce resolution or quality if needed.'
      });
    }

    // Use OpenAI (GPT) server-side to analyze the image and return structured JSON
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });

    const imageBase64 = buffer.toString('base64');
    console.log('Prepared base64 length:', imageBase64.length);

    // If Cloudinary is configured, upload the image and prefer the public URL in prompts
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;
    let uploadedImageUrl: string | null = null;
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
      try {
        const cloudUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        const body = new URLSearchParams();
        // send as data URL
        body.append('file', `data:${detected};base64,${imageBase64}`);
        body.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const cu = await fetch(cloudUrl, { method: 'POST', body });
        if (cu.ok) {
          const cj = await cu.json();
          uploadedImageUrl = cj.secure_url || cj.url || null;
          console.log('Uploaded image to Cloudinary:', uploadedImageUrl);
        } else {
          const text = await cu.text();
          console.warn('Cloudinary upload failed:', cu.status, text);
        }
      } catch (e) {
        console.warn('Cloudinary upload exception', e);
      }
    }

    const systemPrompt = `Eres un historiador del arte experto. Te daré una imagen codificada en base64 y debes devolver SÓLO un JSON válido EXACTAMENTE con las claves: title, author, year, movement, technique, dimensions, location, description, characters, image_url. Cada clave debe ser una cadena de texto simple (sin Markdown, sin etiquetas HTML) o null si no se puede identificar. 'characters' debe ser un arreglo (puede estar vacío) de objetos con las propiedades 'name' y 'role'. 'image_url' debe ser una URL si está disponible o null. No añadas texto adicional, explicaciones ni delimitadores; responde únicamente con el JSON puro.`;

    const userPrompt = uploadedImageUrl
      ? `Image URL: ${uploadedImageUrl}\n\nDevuélveme únicamente el JSON pedido, sin texto adicional.`
      : `Image (base64):\n${imageBase64}\n\nDevuélveme únicamente el JSON pedido, sin texto adicional.`;

    const payload = {
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0,
      max_tokens: 1500,
    };

    let r: Response | null = null;
    let responseText = '';

    // First attempt: use OpenAI Responses API with multimodal input (image + text)
    try {
      const multimodalPayload = {
        model: OPENAI_MODEL,
        input: [
          { role: 'system', content: [{ type: 'output_text', text: systemPrompt }] },
          {
            role: 'user',
            content: [
              { type: 'input_image', image_base64: imageBase64 },
              { type: 'input_text', text: userPrompt }
            ]
          }
        ]
      };

      console.log('Sending multimodal payload to OpenAI responses API', OPENAI_MODEL);
      r = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(multimodalPayload),
      });

      if (r.ok) {
        const jr = await r.json();
        // Try to extract text output from Responses API structure
        const out = jr.output && Array.isArray(jr.output) ? jr.output[0] : jr;
        if (out && Array.isArray(out.content)) {
          const t = out.content.find((c: any) => c.type === 'output_text' || c.type === 'text');
          responseText = t?.text ?? t?.text ?? JSON.stringify(out.content);
        } else if (typeof jr.output === 'string') {
          responseText = jr.output;
        } else if (typeof jr.output?.[0]?.content?.[0]?.text === 'string') {
          responseText = jr.output[0].content[0].text;
        } else {
          responseText = JSON.stringify(jr);
        }
      } else {
        // keep r (non-ok) to let fallback attempt happen
        console.warn('Multimodal request returned non-ok status', r.status);
      }
    } catch (fetchErr: any) {
      console.warn('Multimodal OpenAI request failed, will fallback to chat/completions method', fetchErr?.message ?? fetchErr);
      r = null;
    }

    // Fallback: use chat completions by embedding base64 in prompt (older approach)
    if (!responseText) {
      try {
        console.log('Falling back to chat.completions payload to OpenAI');
        r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify(payload),
        });
      } catch (fetchErr: any) {
        console.error('OpenAI fetch failed (fallback):', fetchErr);
        const imageSize = buffer.length;
        return res.status(502).json({
          error: 'OpenAI request failed',
          message: String(fetchErr.message ?? fetchErr),
          suggestion:
            'Posibles causas: problema de red, bloqueo por firewall, o payload demasiado grande (imagen base64). Intenta subir la imagen a un storage público y pasar la URL en el prompt.',
          imageSizeBytes: imageSize,
          stack: fetchErr.stack ? String(fetchErr.stack) : undefined,
        });
      }
    }


    if (!r) return res.status(502).json({ error: 'No response from OpenAI' });

    if (!r.ok) {
      const t = await r.text();
      return res.status(r.status).json({ error: t });
    }

    const json = await r.json();
    // If we didn't already extract text from multimodal branch, try to read from chat/completions structure
    if (!responseText) {
      responseText = json.choices?.[0]?.message?.content ?? json.choices?.[0]?.message?.content?.[0]?.text ?? json.output?.[0]?.content?.[0]?.text ?? '';
    }
    console.log('OpenAI response content:', String(responseText).slice(0, 1000));

    // Try parse JSON directly, otherwise extract JSON substring
    let parsed: any = null;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      const match = String(responseText).match(/\{[\s\S]*\}/m);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (err) {
          // fallthrough
        }
      }
    }

    if (!parsed) {
      return res.status(200).json({ raw: responseText, _debug_content: responseText, _image_hash: imageHash });
    }

    // Normalize parsed fields: ensure simple strings or null, and normalize characters array
    const coerceString = (v: any) => {
      if (v === undefined || v === null) return null;
      if (typeof v === 'string') return v.trim() === '' ? null : v;
      try {
        return String(v);
      } catch (e) {
        return null;
      }
    };

    const normalizeCharacters = (v: any) => {
      if (!v) return null;
      if (Array.isArray(v)) {
        return v.map((c) => {
          if (!c) return { name: '', role: '' };
          if (typeof c === 'string') return { name: c, role: '' };
          return { name: coerceString(c.name) ?? coerceString(c.nombre) ?? '', role: coerceString(c.role) ?? coerceString(c.rol) ?? '' };
        }).filter((c) => c.name || c.role);
      }
      if (typeof v === 'string') {
        // split lines into simple name-role pairs when possible
        const lines = v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) return null;
        return lines.map((l) => {
          const m = l.match(/^(.+?)\s*[-–—:\t]\s*(.+)$/);
          if (m) return { name: m[1].trim(), role: m[2].trim() };
          return { name: l, role: '' };
        });
      }
      // unexpected shape
      return null;
    };

    const result: AnalysisResult = {
      title: coerceString(parsed.title),
      author: coerceString(parsed.author),
      year: coerceString(parsed.year),
      movement: coerceString(parsed.movement),
      technique: coerceString(parsed.technique),
      dimensions: coerceString(parsed.dimensions),
      location: coerceString(parsed.location),
      description: coerceString(parsed.description) ?? coerceString(parsed._raw) ?? null,
      characters: normalizeCharacters(parsed.characters) ?? null,
      image_url: coerceString(parsed.image_url),
    };

    // include raw model content for local debugging
    return res.status(200).json({ ...result, _debug_content: responseText, _image_hash: imageHash });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

function detectMimeType(buf: Buffer) {
  if (buf.length < 4) return null;
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg';
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
  return null;
}
