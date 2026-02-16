"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

interface Artwork {
  id: number;
  title: string;
  author: string;
  year: string;
  movement: string;
  technique: string;
  dimensions: string;
  location: string;
  description: string;
  image: string;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

export default function ObraDetalle() {
  const params = useParams() as { id: string };
  const id = params.id;

  const [obra, setObra] = useState<Artwork | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!id) return;

    fetch(`/api/artworks/${id}`)
      .then(res => res.json())
      .then(data => setObra(data))
      .catch(err => console.error(err));
  }, [id]);

  const openLightbox = useCallback(() => {
    setLightboxOpen(true);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, closeLightbox, zoomIn, zoomOut]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const el = document.getElementById("lightbox-overlay");
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
      else setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [lightboxOpen]);

  if (!obra) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-(--muted-foreground) border-t-(--primary)"
          aria-label="Loading artwork"
        />
      </div>
    );
  }

  return (
    <>
      {/* Back */}
      <div className="p-(--spacing-lg)">
        <a href="/gallery" className="inline-flex items-center gap-(--spacing-sm)">
          ← Back to gallery
        </a>
      </div>

      <section className="mx-auto w-full max-w-[1280px] px-4 pb-(--spacing-4xl)">
        <div className="grid grid-cols-1 gap-(--spacing-2xl) lg:grid-cols-2 lg:items-start">

          {/* IMAGE - click opens lightbox. Fixed height, does not stretch */}
          <button
            type="button"
            onClick={openLightbox}
            className="cursor-zoom-in w-full shrink-0 self-start border bg-(--card) p-(--spacing-lg) text-left"
          >
            <img
              src={obra.image}
              alt={obra.title}
              className="w-full h-auto max-h-[42vh] object-contain"
            />
          </button>

          {/* INFO - technique, title, metadata, add to collection */}
          <div className="min-w-0">
            <span className="inline-block bg-(--primary) px-3 py-1 text-sm text-white">
              {obra.technique}
            </span>

            <h1 className="mt-4 text-4xl italic">
              {obra.title}
            </h1>

            <div className="mt-6 space-y-2 text-lg">
              <p><b>Author:</b> {obra.author}</p>
              <p><b>Year:</b> {obra.year}</p>
              <p><b>Movement:</b> {obra.movement}</p>
              <p><b>Dimensions:</b> {obra.dimensions}</p>
              <p><b>Location:</b> {obra.location}</p>
            </div>

            <button
              onClick={async () => {
                await fetch("/api/collections", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    user_id: 1,
                    artwork_id: obra.id,
                  }),
                });

                alert("Artwork added to your collection");
              }}
            >
             + Add to my collection
            </button>
          </div>

          {/* DESCRIPTION - spans both columns full width */}
          <div className="min-w-0 col-span-full lg:col-span-2">
            <h2 className="text-2xl mb-4">Description</h2>
            {obra.description.split("\n\n").map((p, i) => (
              <p key={i} className="mb-4 text-(--muted-foreground)">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox: dark overlay, almost full-screen image with zoom */}
      {lightboxOpen && (
        <div
          id="lightbox-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="View image full screen"
        >
          <div
            className="absolute right-4 top-4 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={zoomOut}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="flex items-center px-2 text-sm text-white">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={closeLightbox}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div
            className="flex max-h-[90vh] max-w-[90vw] items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={obra.image}
              alt={obra.title}
              className="max-h-[90vh] max-w-full object-contain transition-transform duration-150"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              }}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
