/**
 * API POST /api/artworks/[id]/analyze-characters
 * Analiza los personajes de una obra mediante IA (OpenAI visión).
 * Obtiene la obra de la BD (título, autor, imagen) y envía la URL de la imagen a OpenAI
 * con un prompt específico. Devuelve JSON: { obra, personajes }.
 * No afecta a /api/ai-recognition.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../../lib/db/db";
import OpenAI from "openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid artwork ID" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
  }

  try {
    const artworkResult = await pool.query("SELECT id, title, author, year, ubication, image FROM artworks WHERE id = $1", [id]);
    if (artworkResult.rows.length === 0) {
      return res.status(404).json({ error: "Artwork not found" });
    }
    const artwork = artworkResult.rows[0] as { title: string; author: string; year?: string; ubication?: string; image?: string };
    const title = artwork.title || "Unknown artwork";
    const author = artwork.author || "Unknown author";
    const imageUrl = artwork.image;

    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({ error: "Artwork has no image URL" });
    }

    const systemPrompt = `Analyze the artwork "${title}" by ${author} using the provided image and return valid JSON.

Mandatory requirements:
- The JSON must have a root key "obra" with general information about the painting (title, author, date, location, and overall objective).
- The "obra" object MUST also include a boolean field "has_characters".
- There must be a key "personajes" that is an array.
- If the image does NOT contain identifiable characters/figures (e.g. abstract art, landscape, still life, architecture without people), set "obra.has_characters" to false and set "personajes" to [].
- If you are not sure, prefer "obra.has_characters": false and "personajes": [] (do NOT guess).
- Only include characters that are clearly present in the image. Do not infer characters from the title, author, or common art-history associations.
- If "obra.has_characters" is true, each character must include at least: "nombre", "disciplina", "ubicacion" (approximate position within the artwork), "identificacion_visual" (how the character is recognized in the painting), "representa" (what idea, philosophical current or concept they symbolize in the work), "objetivo_del_autor" (the concrete intention of ${author} in including that character).
- The information must be based on the most accepted historiographical consensus, avoiding unnecessary speculation. If the character identity is not known, do not invent it; set "obra.has_characters" to false and return an empty array.
- The result must be exclusively JSON, with no additional explanations, comments or text outside the block.
- The JSON must be readable, coherent and suitable for academic or technical use (web, API or database).
- Do not include fictitious characters or repeat information between fields. Use clear and precise language in English for all fields.`;

    const userContent = `Analyze the image of "${title}" by ${author} and return only the JSON as specified.`;

    const client = new OpenAI({ apiKey: OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userContent },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 4000,
    });

    let responseText = completion.choices?.[0]?.message?.content ?? "";
    let textToParse = String(responseText).trim();

    const codeBlock = textToParse.match(/```(?:json)?\s*([\s\S]*?)```/m);
    if (codeBlock) textToParse = codeBlock[1].trim();

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(textToParse) as Record<string, unknown>;
      console.log(parsed);
    } catch {
      const match = String(textToParse).match(/\{[\s\S]*\}/m);
      if (match) {
        try {
          parsed = JSON.parse(match[0]) as Record<string, unknown>;
        } catch {
          // fallthrough
        }
      }
    }

    if (!parsed) {
      return res.status(200).json({ raw: responseText, error: "Could not parse JSON from model response" });
    }

    // Normalize output shape for frontend.
    if (!parsed.obra || typeof parsed.obra !== "object") {
      parsed.obra = { title, author };
    }
    const personajes = (parsed as any).personajes;
    if (!Array.isArray(personajes)) {
      (parsed as any).personajes = [];
    } else {
      // Remove empty/invalid items.
      (parsed as any).personajes = personajes.filter(
        (p: any) => p && typeof p === "object" && typeof p.nombre === "string" && p.nombre.trim().length > 0
      );
    }

    return res.status(200).json(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("analyze-characters error:", msg);
    return res.status(502).json({
      error: "Character analysis failed",
      message: msg,
    });
  }
}
