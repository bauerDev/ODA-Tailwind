"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Artwork } from "@/types/artwork";

export default function GaleriaPage() {
  const [artworks, setArtwork] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Selection in the panel (pending apply)
  const [pendingAuthor, setPendingAuthor] = useState<Set<string>>(new Set());
  const [pendingYear, setPendingYear] = useState<Set<string>>(new Set());
  const [pendingMovement, setPendingMovement] = useState<Set<string>>(new Set());
  const [pendingTechnique, setPendingTechnique] = useState<Set<string>>(new Set());

  // Applied filters (used to filter the list)
  const [appliedAuthor, setAppliedAuthor] = useState<Set<string>>(new Set());
  const [appliedYear, setAppliedYear] = useState<Set<string>>(new Set());
  const [appliedMovement, setAppliedMovement] = useState<Set<string>>(new Set());
  const [appliedTechnique, setAppliedTechnique] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/artworks")
      .then((res) => res.json())
      .then((data) => {
        setArtwork(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const uniqueAuthors = useMemo(() => [...new Set(artworks.map((a) => a.author).filter(Boolean))].sort(), [artworks]);
  const uniqueYears = useMemo(() => [...new Set(artworks.map((a) => a.year).filter(Boolean))].sort(), [artworks]);
  const uniqueMovements = useMemo(() => [...new Set(artworks.map((a) => a.movement).filter(Boolean))].sort(), [artworks]);
  const uniqueTechniques = useMemo(() => [...new Set(artworks.map((a) => a.technique).filter(Boolean))].sort(), [artworks]);

  const filteredArtworks = useMemo(() => {
    return artworks.filter((a) => {
      if (appliedAuthor.size > 0 && !appliedAuthor.has(a.author)) return false;
      if (appliedYear.size > 0 && !appliedYear.has(a.year)) return false;
      if (appliedMovement.size > 0 && !appliedMovement.has(a.movement)) return false;
      if (appliedTechnique.size > 0 && !appliedTechnique.has(a.technique)) return false;
      return true;
    });
  }, [artworks, appliedAuthor, appliedYear, appliedMovement, appliedTechnique]);

  const applyFilters = () => {
    setAppliedAuthor(new Set(pendingAuthor));
    setAppliedYear(new Set(pendingYear));
    setAppliedMovement(new Set(pendingMovement));
    setAppliedTechnique(new Set(pendingTechnique));
    setPanelOpen(false);
  };

  const clearFilters = () => {
    const empty = new Set<string>();
    setPendingAuthor(empty);
    setPendingYear(empty);
    setPendingMovement(empty);
    setPendingTechnique(empty);
    setAppliedAuthor(empty);
    setAppliedYear(empty);
    setAppliedMovement(empty);
    setAppliedTechnique(empty);
    setPanelOpen(false);
  };

  const togglePanel = () => {
    if (panelOpen) {
      setPanelOpen(false);
      return;
    }
    setPanelOpen(true);
    setPendingAuthor(new Set(appliedAuthor));
    setPendingYear(new Set(appliedYear));
    setPendingMovement(new Set(appliedMovement));
    setPendingTechnique(new Set(appliedTechnique));
  };

  const togglePending = (key: "author" | "year" | "movement" | "technique", value: string) => {
    const setters = {
      author: setPendingAuthor,
      year: setPendingYear,
      movement: setPendingMovement,
      technique: setPendingTechnique,
    };
    const sets = {
      author: pendingAuthor,
      year: pendingYear,
      movement: pendingMovement,
      technique: pendingTechnique,
    };
    const set = sets[key];
    const setter = setters[key];
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const isChecked = (key: "author" | "year" | "movement" | "technique", value: string) => {
    const sets = { author: pendingAuthor, year: pendingYear, movement: pendingMovement, technique: pendingTechnique };
    return sets[key].has(value);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-(--muted-foreground) border-t-(--primary)"
          aria-label="Loading gallery"
        />
      </div>
    );
  }

  return (
    <>
      {/* Page title and description (same size as rest of site) */}
      <section className="border-b border-(--border) bg-white py-(--spacing-2xl)">
        <div className="mx-auto w-full max-w-[1280px] px-4 text-center">
          <h1 className="mb-(--spacing-lg) font-(--font-family-heading) text-4xl md:text-[3rem]">
            Gallery
          </h1>
          <p className="mx-auto my-0 max-w-3xl text-lg text-(--muted-foreground)">
            Browse all artworks and filter by author, movement, year or technique.
          </p>
        </div>
      </section>

      {/* Expand filters / Apply filters / Clear filters */}
      <section className="bg-white py-(--spacing-lg)">
        <div className="mx-auto w-full max-w-[1280px] px-4" ref={panelRef}>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-4">
            <button
              type="button"
              onClick={togglePanel}
              className="cursor-pointer border border-[#1a1a1a] bg-white px-5 py-2 font-(--font-family-heading) text-[15px] text-[#1a1a1a] transition-opacity hover:opacity-80"
            >
              Expand filters
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="cursor-pointer border border-[#1a1a1a] bg-white px-5 py-2 font-(--font-family-heading) text-[15px] text-[#1a1a1a] transition-opacity hover:opacity-80"
            >
              Apply filters
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer border border-[#1a1a1a] bg-white px-5 py-2 font-(--font-family-heading) text-[15px] text-[#1a1a1a] transition-opacity hover:opacity-80"
            >
              Clear filters
            </button>
          </div>

          {/* Dropdown panel: Author, Movement, Year, Technique with checkboxes */}
          {panelOpen && (
            <div className="mt-(--spacing-lg) rounded-none bg-[#f5f5f0] p-(--spacing-lg) shadow-sm">
              <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <h3 className="mb-3 font-(--font-family-heading) text-[15px] text-[#1a1a1a]">
                    Author
                  </h3>
                  <ul className="space-y-2">
                    {uniqueAuthors.map((author) => (
                      <li key={author}>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked("author", author)}
                            onChange={() => togglePending("author", author)}
                            className="h-4 w-4 accent-(--primary) border-[#1a1a1a]"
                          />
                          <span
                            className={`font-(--font-family-heading) text-[14px] ${isChecked("author", author) ? "text-[#1a1a1a]" : "text-[#6a6a6a]"}`}
                          >
                            {author}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 font-(--font-family-heading) text-[15px] text-[#1a1a1a]">
                    Movement
                  </h3>
                  <ul className="space-y-2">
                    {uniqueMovements.map((movement) => (
                      <li key={movement}>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked("movement", movement)}
                            onChange={() => togglePending("movement", movement)}
                            className="h-4 w-4 accent-(--primary) border-[#1a1a1a]"
                          />
                          <span
                            className={`font-(--font-family-heading) text-[14px] ${isChecked("movement", movement) ? "text-[#1a1a1a]" : "text-[#6a6a6a]"}`}
                          >
                            {movement}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 font-(--font-family-heading) text-[15px] text-[#1a1a1a]">
                    Year
                  </h3>
                  <ul className="space-y-2">
                    {uniqueYears.map((year) => (
                      <li key={year}>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked("year", year)}
                            onChange={() => togglePending("year", year)}
                            className="h-4 w-4 accent-(--primary) border-[#1a1a1a]"
                          />
                          <span
                            className={`font-(--font-family-heading) text-[14px] ${isChecked("year", year) ? "text-[#1a1a1a]" : "text-[#6a6a6a]"}`}
                          >
                            {year}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 font-(--font-family-heading) text-[15px] text-[#1a1a1a]">
                    Technique
                  </h3>
                  <ul className="space-y-2">
                    {uniqueTechniques.map((technique) => (
                      <li key={technique}>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked("technique", technique)}
                            onChange={() => togglePending("technique", technique)}
                            className="h-4 w-4 accent-(--primary) border-[#1a1a1a]"
                          />
                          <span
                            className={`font-(--font-family-heading) text-[14px] ${isChecked("technique", technique) ? "text-[#1a1a1a]" : "text-[#6a6a6a]"}`}
                          >
                            {technique}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-(--spacing-2xl)">
        <div className="mx-auto w-full max-w-[1280px] px-4">
          <div className="grid grid-cols-1 gap-(--spacing-xl) sm:grid-cols-2 lg:grid-cols-3">
            {filteredArtworks.map((artwork) => (
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
          {filteredArtworks.length === 0 && (
            <p className="py-(--spacing-2xl) text-center font-(--font-family-heading) text-(--muted-foreground)">
              No artworks match the current filters.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
