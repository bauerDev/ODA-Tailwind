"use client";

import { useEffect, useState } from "react";
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

export default function ObraDetalle() {
  const params = useParams() as { id: string };
  const id = params.id;

  const [obra, setObra] = useState<Artwork | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/artworks/${id}`) // Ruta relativa funciona porque ahora es client
      .then(res => res.json())
      .then(data => setObra(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!obra) return <p className="p-8">Loading artwork...</p>;

  return (
    <>
      {/* Back */}
      <div className="p-(--spacing-lg)">
        <a href="/gallery" className="inline-flex items-center gap-(--spacing-sm)">
          ← Back to gallery
        </a>
      </div>

      <section className="mx-auto w-full max-w-[1280px] px-4 pb-(--spacing-4xl)">
        <div className="grid grid-cols-1 gap-(--spacing-2xl) lg:grid-cols-2">

          {/* IMAGE */}
          <div className="border bg-(--card) p-(--spacing-lg)">
            <img
              src={obra.image}
              alt={obra.title}
              className="w-full h-auto"
            />
          </div>

          {/* INFO */}
          <div>
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

            <div className="mt-8 max-w-[65ch]">
              <h2 className="text-2xl mb-4">Description</h2>
              {obra.description.split("\n\n").map((p, i) => (
                <p key={i} className="mb-4 text-(--muted-foreground)">
                  {p}
                </p>
              ))}
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
        </div>
      </section>
    </>
  );
}
