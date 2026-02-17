"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Artwork {
  id: number;
  title: string;
  author: string;
  year: string;
  movement: string;
  technique: string;
  dimensions: string;
  location?: string;
  ubication?: string;
  description: string;
  image: string;
}

type Collection = { id: number; name: string };

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

export default function ObraDetalle() {
  const params = useParams() as { id: string };
  const id = params.id;

  const { data: session, status } = useSession();
  const [obra, setObra] = useState<Artwork | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [addToCollectionOpen, setAddToCollectionOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [addToCollectionLoading, setAddToCollectionLoading] = useState(false);
  const [addToCollectionMessage, setAddToCollectionMessage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [inCollections, setInCollections] = useState<Collection[]>([]);
  const [removingFromId, setRemovingFromId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const fetchInCollections = useCallback(() => {
    if (!id || !session?.user) return;
    fetch(`/api/artworks/${id}/collections`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setInCollections)
      .catch(() => setInCollections([]));
  }, [id, session?.user]);

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
    if (status === "authenticated" && id) {
      fetchInCollections();
    } else {
      setInCollections([]);
    }
  }, [status, id, fetchInCollections]);

  useEffect(() => {
    if (addToCollectionOpen && session?.user) {
      fetch("/api/collections")
        .then((res) => (res.ok ? res.json() : []))
        .then(setCollections)
        .catch(() => setCollections([]));
    }
  }, [addToCollectionOpen, session?.user]);

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
              <p><b>Location:</b> {obra.location ?? obra.ubication ?? "—"}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-(--spacing-sm)">
              <button
                type="button"
                onClick={() => {
                  setAddToCollectionMessage(null);
                  setAddToCollectionOpen(true);
                }}
                className="inline-flex items-center gap-1 bg-(--primary) px-4 py-2 text-sm text-(--primary-foreground) transition hover:opacity-90"
              >
                + Add to my collection
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!obra) return;
                  try {
                    setAnalyzing(true);
                    // fetch artwork image and send to existing ai-recognition endpoint
                    const imgRes = await fetch(obra.image);
                    if (!imgRes.ok) throw new Error('Failed to fetch image');
                    const blob = await imgRes.blob();
                    const file = new File([blob], 'image', { type: blob.type });
                    const fd = new FormData();
                    fd.append('image', file);

                    const res = await fetch('/api/ai-recognition', { method: 'POST', body: fd });
                    const data = await res.json().catch(() => ({}));

                    let appendText = '';
                    if (!res.ok) {
                      appendText = '\n\n[Character analysis failed: ' + (data?.error || 'server error') + ']';
                    } else if (data?.is_artwork === false) {
                      appendText = '\n\nNo characters to analyze.';
                    } else {
                      const desc: string = (data?.description || '') as string;
                      // Heuristic extraction: split into sentences and pick those mentioning people/figures
                      const sentences = desc.split(/(?<=[.!?])\s+/);
                      const personKeywords = ['figure','figures','man','woman','child','boy','girl','person','people','saint','servant','soldier','angel','portrait','kneeling','standing','seated'];
                      const locationKeywords = ['left','right','center','centre','top','bottom','foreground','background','upper','lower','top-left','top-right','bottom-left','bottom-right','middle','centre-left','centre-right','center-left','center-right'];
                      const roleKeywords = ['protagonist','central','background','supporting','focal','main','symbolic','allegorical','narrative'];

                      const charSentences = sentences.filter((s) => personKeywords.some(k => new RegExp('\\b' + k + '\\b','i').test(s)));

                      if (charSentences.length === 0) {
                        appendText = '\n\nNo characters to analyze.';
                      } else {
                        const parts: string[] = ['\n\nCharacters identified:'];
                        charSentences.forEach((s, idx) => {
                          // location detection
                          const locMatch = locationKeywords.find(k => new RegExp('\\b' + k + '\\b','i').test(s));
                          const roleMatch = roleKeywords.find(k => new RegExp('\\b' + k + '\\b','i').test(s));
                          const location = locMatch ? locMatch : 'location not specified';
                          const role = roleMatch ? roleMatch : 'role not specified';

                          // try to extract a short name or label (proper noun) from the sentence
                          const nameMatch = s.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/);
                          const name = nameMatch ? nameMatch[0] : null;

                          const heading = name ? `${idx + 1}. ${name}` : `${idx + 1}. (unnamed)`;
                          const summary = s.replace(/\s+/g, ' ').trim();

                          parts.push(`${heading} — Location: ${location}; Role: ${role}\nDescription: ${summary}`);
                        });

                        appendText = parts.join('\n\n');
                      }
                    }

                    setObra((prev) => prev ? { ...prev, description: (prev.description || '') + appendText } : prev);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setAnalyzing(false);
                  }
                }}
                className="inline-flex items-center gap-1 border border-(--border) bg-transparent px-4 py-2 text-sm text-(--foreground) transition hover:bg-(--muted)"
              >
                {analyzing ? 'Analyzing...' : 'Analyze characters'}
              </button>
            </div>

            {status === "authenticated" && inCollections.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-(--muted-foreground)">In your collections</p>
                <div className="flex flex-wrap gap-2">
                  {inCollections.map((col) => (
                    <span
                      key={col.id}
                      className="inline-flex items-center gap-1 border border-(--border) bg-(--muted)/50 px-3 py-1.5 text-sm text-(--foreground)"
                    >
                      <Link href={`/my-collection/${col.id}`} className="hover:underline">
                        {col.name}
                      </Link>
                      <button
                        type="button"
                        disabled={removingFromId === col.id}
                        className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground) disabled:opacity-50"
                        aria-label={`Remove from ${col.name}`}
                        onClick={async () => {
                          setRemovingFromId(col.id);
                          const res = await fetch(`/api/collections/${col.id}/artworks`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ artwork_id: obra.id }),
                          });
                          setRemovingFromId(null);
                          if (res.ok) fetchInCollections();
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add to collection modal */}
            {addToCollectionOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAddToCollectionOpen(false)}>
                <div className="w-full max-w-md rounded-lg border border-(--border) bg-(--card) p-(--spacing-xl) shadow-lg" onClick={(e) => e.stopPropagation()}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-(--font-family-heading) text-xl">Add to collection</h3>
                    <button type="button" className="text-(--muted-foreground) hover:text-(--foreground)" onClick={() => setAddToCollectionOpen(false)} aria-label="Close">×</button>
                  </div>
                  {status !== "authenticated" ? (
                    <>
                      <p className="text-(--muted-foreground)">Sign in to add this artwork to a collection.</p>
                      <Link href="/login" className="mt-4 inline-block text-(--primary)">Sign in</Link>
                    </>
                  ) : collections.length === 0 ? (
                    <>
                      <p className="text-(--muted-foreground)">You haven&apos;t created any collections yet. Create one first to add artworks.</p>
                      <Link href="/my-collection" className="mt-4 inline-block bg-(--primary) px-4 py-2 text-sm text-(--primary-foreground)">Go to My Collection</Link>
                    </>
                  ) : (
                    <>
                      {addToCollectionMessage && <p className="mb-2 text-sm text-green-600">{addToCollectionMessage}</p>}
                      <p className="mb-2 text-sm text-(--muted-foreground)">Choose a collection to add this artwork to:</p>
                      <ul className="max-h-60 overflow-y-auto border border-(--border)">
                        {collections.map((col) => (
                          <li key={col.id}>
                            <button
                              type="button"
                              disabled={addToCollectionLoading}
                              className="w-full cursor-pointer px-4 py-2 text-left text-(--foreground) hover:bg-(--muted) disabled:opacity-50"
                              onClick={async () => {
                                setAddToCollectionLoading(true);
                                setAddToCollectionMessage(null);
                                const res = await fetch(`/api/collections/${col.id}/artworks`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ artwork_id: obra.id }),
                                });
                                const data = await res.json().catch(() => ({}));
                                setAddToCollectionLoading(false);
                                if (res.ok) {
                                  setAddToCollectionMessage("Added to " + col.name);
                                  fetchInCollections();
                                } else {
                                  setAddToCollectionMessage(data.error || "Failed to add");
                                }
                              }}
                            >
                              {col.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/my-collection"
                        className="mt-4 inline-flex items-center gap-1 border border-(--border) bg-transparent px-4 py-2 text-sm text-(--foreground) transition hover:bg-(--muted)"
                      >
                        Create new collection
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
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
