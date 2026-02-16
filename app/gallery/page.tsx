"use client";

import { useEffect, useState } from "react";
import { Artwork } from "@/types/artwork";

export default function GaleriaPage() {
  const [artworks, setArtwork] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    fetch("/api/artworks")
    .then(res => res.json())
    .then(data => {
      setArtwork(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
}, []);
if (loading) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-(--muted-foreground) border-t-(--primary)"
        aria-label="Cargando galería"
      />
    </div>
  );
}

  return (
    <>
      {/* ... header y filtros ... */}

      <section className="py-(--spacing-2xl)">
        <div className="mx-auto w-full max-w-[1280px] px-4">
          <div className="grid grid-cols-1 gap-(--spacing-xl) sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => (
              <a key={artwork.id} href={`/artwork/${artwork.id}`} className="block group">
                <article className="relative block border border-[#afafaf80] bg-(--card) transition-shadow duration-(--transition-normal) hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                  <div className="relative w-full overflow-hidden pb-[75%]">
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      className="absolute left-0 top-0 h-full w-full object-cover transition-transform duration-(--transition-slow) group-hover:scale-105"
                    />
                  </div>

                  <div className="p-(--spacing-lg)">
                    <div className="flex items-start justify-between gap-(--spacing-sm)">
                      <div className="flex-1">
                        <h3 className="mb-(--spacing-xs) font-(--font-family-heading) text-xl italic text-(--foreground)">
                          {artwork.title}
                        </h3>
                        <p className="text-sm text-(--muted-foreground)">
                          {artwork.author} ({artwork.year})
                        </p>
                        <p className="text-sm text-(--muted-foreground)">
                          {artwork.movement}
                        </p>
                      </div>
                      <span className="inline-block shrink-0 bg-(--primary) px-3 py-(--spacing-xs) font-(--font-family-heading) text-sm text-(--primary-foreground)">
                        {artwork.technique}
                      </span>
                    </div>

                    <button
                      className="absolute bottom-(--spacing-lg) right-(--spacing-lg) flex h-8 w-8 items-center justify-center bg-(--foreground) text-(--background) transition-opacity duration-(--transition-fast) hover:opacity-80"
                      aria-label="Add to my collection"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </article>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
