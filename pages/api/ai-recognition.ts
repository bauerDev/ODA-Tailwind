/**
 * API POST /api/ai-recognition
 * Receives an image via multipart/form-data (field "image" or "file"), resizes if over ~90KB,
 * sends it to OpenAI (vision model) and returns JSON: is_artwork, title, author, year,
 * movement, technique, dimensions, location, description (~2000 chars, paragraphs with double newline),
 * image_url. If is_artwork is false, the rest are null. Requires OPENAI_API_KEY.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import type { File as FormidableFile } from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: false, // Formidable parses multipart/form-data
  },
};

type AnalysisResult = {
  is_artwork?: boolean;
  title?: string | null;
  author?: string | null;
  year?: string | null;
  movement?: string | null;
  technique?: string | null;
  dimensions?: string | null;
  location?: string | null;
  description?: string | null;
  image_url?: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

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
    const detected = (file as any).mimetype || detectMimeType(buffer) || '';

    const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED_MIMES.includes(detected)) {
      return res.status(400).json({ error: 'Unsupported image type. Use JPG, PNG, WEBP or GIF.' });
    }

    // Reduce size to stay within OpenAI context limit (128k tokens)
    let bufferToSend: Buffer = Buffer.from(buffer);
    const MAX_BYTES_FOR_API = 90 * 1024; // ~90KB keeps us safely under token limit
    if (buffer.length > MAX_BYTES_FOR_API) {
      try {
        const sharp = (await import('sharp')).default;
        // Cast for sharp input/output: Node Buffer typing is broader than sharp's NonSharedBuffer
        const input = buffer as Parameters<typeof sharp>[0];
        const out1 = await sharp(input)
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        bufferToSend = out1 as Buffer;
        if (bufferToSend.length > MAX_BYTES_FOR_API) {
          const out2 = await sharp(input)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 70 })
            .toBuffer();
          bufferToSend = out2 as Buffer;
        }
      } catch (sharpErr: any) {
        console.warn('Sharp resize failed, using original:', sharpErr?.message);
      }
    }

    const imageBase64 = bufferToSend.toString('base64');

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });

    // Prompt: response in English, is_artwork, description ~2000 chars, paragraphs with double newline
    const systemPrompt = `You are an expert art historian. I will give you an image (base64) and you must return ONLY a valid JSON with exactly these keys: is_artwork, title, author, year, movement, technique, dimensions, location, description, image_url. "is_artwork" must be a boolean: true if the image clearly depicts an artwork (painting, sculpture, drawing, etc.) that can be identified or analyzed; false if the image does NOT depict an artwork (e.g. random photo, person, landscape, meme, screenshot, document, or anything that is not a work of art). When is_artwork is false, set all other fields to null. When is_artwork is true, all values must be in English. Each other key must be a simple text string (no Markdown, no HTML) or null if unknown. The "description" field must be approximately 2000 characters: a detailed analysis of the artwork including subject, composition, technique, historical context, and significance. Format the description with a blank line (double newline) between each paragraph. "image_url" must be a URL if available or null. Do not add any extra text, explanations, or delimiters; respond only with the raw JSON.`;

    const dataUrl = `data:${detected};base64,${imageBase64}`;
    const userContent = 'Return only the requested JSON, no additional text.';

    const client = new OpenAI({ apiKey: OPENAI_API_KEY });
    let responseText = '';

    try {
      const completion = await client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userContent },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        temperature: 0,
        max_tokens: 3500,
      });
      responseText = completion.choices?.[0]?.message?.content ?? '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('OpenAI ai-recognition error:', msg);
      return res.status(502).json({
        error: 'OpenAI request failed',
        message: msg,
        suggestion: 'Check OPENAI_API_KEY and that the model supports vision (e.g. gpt-4o-mini).',
      });
    }

    // Remove ```json ... ``` wrapper if the AI returned it
    let textToParse = String(responseText).trim();
    const codeBlock = textToParse.match(/```(?:json)?\s*([\s\S]*?)```/m);
    if (codeBlock) textToParse = codeBlock[1].trim();

    // Try to parse JSON; if it fails, extract the first {...} from the text
    let parsed: any = null;
    try {
      parsed = JSON.parse(textToParse);
    } catch (e) {
      const match = String(textToParse).match(/\{[\s\S]*\}/m);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (err) {
          // fallthrough
        }
      }
    }

    if (!parsed) {
      return res.status(200).json({ raw: responseText });
    }

    // Normalize values to string or null for the response
    const coerceString = (v: any) => {
      if (v === undefined || v === null) return null;
      if (typeof v === 'string') return v.trim() === '' ? null : v;
      try {
        return String(v);
      } catch (e) {
        return null;
      }
    };

    const isArtwork = parsed.is_artwork === true || parsed.is_artwork === 'true';
    const result: AnalysisResult = {
      is_artwork: isArtwork,
      title: coerceString(parsed.title),
      author: coerceString(parsed.author),
      year: coerceString(parsed.year),
      movement: coerceString(parsed.movement),
      technique: coerceString(parsed.technique),
      dimensions: coerceString(parsed.dimensions),
      location: coerceString(parsed.location),
      description: coerceString(parsed.description) ?? null,
      image_url: coerceString(parsed.image_url),
    };

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

/** Detects MIME type by magic bytes of the buffer (fallback if formidable does not send it). */
function detectMimeType(buf: Buffer) {
  if (buf.length < 4) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
  return null;
}
