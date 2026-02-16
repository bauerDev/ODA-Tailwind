"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Result = {
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

export default function ArtworkPreview() {
  const [data, setData] = useState<Result | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ai:recognition:result');
      const img = sessionStorage.getItem('ai:recognition:image');
      if (img) setImageSrc(img);
      if (!raw) {
        setData(null);
        return;
      }
      const parsed = JSON.parse(raw);
      // if API included debug content as top-level field, attach it so we can show it
      if (!parsed._debug_content && typeof parsed._debug_content === 'undefined' && (parsed._debug || parsed.raw || parsed._debug_content)) {
        parsed._debug_content = parsed._debug || parsed.raw || parsed._debug_content;
      }
      setData(parsed);
      if (parsed && (parsed as any).image_url) setImageSrc((parsed as any).image_url as string);
    } catch (e) {
      console.error('Failed to load preview data', e);
      setData(null);
    }
  }, []);

  if (!data) {
    return (
      <div className="p-8">
        <p>No recognition data available. Go back and analyze an image first.</p>
        <button onClick={() => router.push('/ai-recognition')} className="mt-4 underline">Back to AI Recognition</button>
      </div>
    );
  }

  return (
    <>
      <div className="p-(--spacing-lg)">
        <a href="/gallery" className="inline-flex items-center gap-(--spacing-sm)">← Back to gallery</a>
      </div>

      <section className="mx-auto w-full max-w-[1280px] px-4 pb-(--spacing-4xl)">
        <div className="grid grid-cols-1 gap-(--spacing-2xl) lg:grid-cols-2">

          <div className="border bg-(--card) p-(--spacing-lg)">
            <img src={imageSrc ?? ''} alt={data.title ?? 'Artwork'} className="w-full h-auto" />
          </div>

          <div>
            <span className="inline-block bg-(--primary) px-3 py-1 text-sm text-white">{data.technique ?? '-'}</span>

            <h1 className="mt-4 text-4xl italic">{data.title ?? '-'}</h1>

            <div className="mt-6 space-y-2 text-lg">
              <p><b>Author:</b> {data.author ?? '-'}</p>
              <p><b>Year:</b> {data.year ?? '-'}</p>
              <p><b>Movement:</b> {data.movement ?? '-'}</p>
              <p><b>Dimensions:</b> {data.dimensions ?? '-'}</p>
              <p><b>Location:</b> {data.location ?? '-'}</p>
            </div>

            <div className="mt-8 max-w-[65ch]">
              <h2 className="text-2xl mb-4">Description</h2>
              {((data.description ?? (data as any)._raw ?? (data as any)._debug_content ?? '-').toString().split("\n\n")).map((p: string, i: number) => (
                <p key={i} className="mb-4 text-(--muted-foreground)">{p}</p>
              ))}
            </div>

            {data.characters && data.characters.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium">Characters</h3>
                <ul className="list-disc pl-(--spacing-lg)">
                  {data.characters.map((c, i) => (
                    <li key={i}>{c.name} — {c.role}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Debug: show raw AI response so we can see why fields might be missing */}
            <div className="mt-8">
              <h3 className="font-medium">Raw AI response</h3>
              <pre className="mt-2 max-w-full overflow-auto rounded bg-(--background) p-4 text-sm">{JSON.stringify(data, null, 2)}</pre>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
