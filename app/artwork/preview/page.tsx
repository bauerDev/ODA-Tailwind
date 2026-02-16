"use client";

import { useEffect, useState, useCallback } from "react";

type Result = {
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

export default function ArtworkPreview() {
  const [data, setData] = useState<Result | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ai:recognition:result");
      const img = sessionStorage.getItem("ai:recognition:image");
      if (!raw) {
        setData(null);
        return;
      }
      const parsed = JSON.parse(raw) as Result & { raw?: string };
      let source: Result = parsed;
      if (typeof parsed.raw === "string" && !parsed.title && !parsed.author) {
        try {
          const stripped = parsed.raw.replace(/```(?:json)?\s*([\s\S]*?)```/m, "$1").trim();
          const match = stripped.match(/\{[\s\S]*\}/m);
          if (match) {
            source = JSON.parse(match[0]) as Result;
          }
        } catch (_) {
          // keep source as parsed
        }
      }
      const normalized: Result = {
        ...source,
        title: source.title ?? null,
        author: source.author ?? null,
        year: source.year ?? null,
        movement: source.movement ?? null,
        technique: source.technique ?? null,
        dimensions: source.dimensions ?? null,
        location: source.location ?? null,
        description: source.description ?? null,
        image_url: source.image_url ?? null,
      };
      setData(normalized);
      // Always prefer dedicated image key (data URL); reject blob: URLs (invalid after redirect)
      const urlFromResult = normalized.image_url;
      const validUrl = urlFromResult && !urlFromResult.startsWith("blob:") ? urlFromResult : null;
      setImageSrc(img ?? validUrl ?? null);
    } catch (e) {
      console.error("Failed to load preview data", e);
      setData(null);
    }
  }, []);

  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-(--muted-foreground)">No recognition data available. Analyze an image first.</p>
        <a href="/ai-recognition" className="rounded-md bg-(--primary) px-4 py-2 text-(--primary-foreground)">
          Back to AI Recognition
        </a>
      </div>
    );
  }

  const descriptionText = data.description ?? "";
  const descriptionParagraphs = descriptionText ? descriptionText.split("\n\n").filter(Boolean) : [];

  return (
    <>
      <div className="p-(--spacing-lg)">
        <a href="/ai-recognition" className="inline-flex items-center gap-(--spacing-sm)">
          ← Back to AI Recognition
        </a>
      </div>

      <section className="mx-auto w-full max-w-[1280px] px-4 pb-(--spacing-4xl)">
        <div className="grid grid-cols-1 gap-(--spacing-2xl) lg:grid-cols-2 lg:items-start">
          {/* Image - same as /artwork/[id] */}
          <button
            type="button"
            onClick={openLightbox}
            className="cursor-zoom-in w-full shrink-0 self-start border bg-(--card) p-(--spacing-lg) text-left"
          >
            <img
              src={imageSrc ?? ""}
              alt={data.title ?? "Artwork"}
              className="w-full h-auto max-h-[42vh] object-contain"
            />
          </button>

          {/* Info - Author, Year, Movement, Dimensions, Location */}
          <div className="min-w-0">
            <span className="inline-block bg-(--primary) px-3 py-1 text-sm text-white">
              {data.technique ?? "—"}
            </span>

            <h1 className="mt-4 text-4xl italic">
              {data.title ?? "Unknown artwork"}
            </h1>

            <div className="mt-6 space-y-2 text-lg">
              <p><b>Author:</b> {data.author ?? "—"}</p>
              <p><b>Year:</b> {data.year ?? "—"}</p>
              <p><b>Movement:</b> {data.movement ?? "—"}</p>
              <p><b>Dimensions:</b> {data.dimensions ?? "—"}</p>
              <p><b>Location:</b> {data.location ?? "—"}</p>
            </div>
          </div>

          {/* Description - full width below */}
          <div className="min-w-0 col-span-full lg:col-span-2">
            <h2 className="text-2xl mb-4">Description</h2>
            {descriptionParagraphs.length > 0 ? (
              descriptionParagraphs.map((p, i) => (
                <p key={i} className="mb-4 text-(--muted-foreground)">
                  {p}
                </p>
              ))
            ) : (
              <p className="mb-4 text-(--muted-foreground)">—</p>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox - same as /artwork/[id] */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="View image full screen"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            aria-label="Close"
          >
            ×
          </button>
          <div
            className="flex max-h-[90vh] max-w-[90vw] items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageSrc ?? ""}
              alt={data.title ?? "Artwork"}
              className="max-h-[90vh] max-w-full object-contain"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
