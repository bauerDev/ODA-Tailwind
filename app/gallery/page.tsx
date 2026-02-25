"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Artwork } from "@/types/artwork";

type Collection = { id: number; name: string };

/** Minimal type for Choices instance to avoid importing choices.js on server (document is not defined). */
interface ChoicesInstanceLike {
  getValue(single?: boolean): string | string[];
  setChoiceByValue(values: string[]): void;
  destroy(): void;
  removeActiveItems?(): void;
  passedElement: { element: HTMLElement };
}

/** Parse year string to number (e.g. "1503", "c. 1503" -> 1503). Returns null if not parseable. */
function parseYear(y: string): number | null {
  if (!y || typeof y !== "string") return null;
  const match = y.trim().match(/\d{4}/);
  return match ? parseInt(match[0], 10) : null;
}

export default function GaleriaPage() {
  const { data: session, status } = useSession();
  const [artworks, setArtwork] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [addToCollectionArtworkId, setAddToCollectionArtworkId] = useState<number | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [addToCollectionLoading, setAddToCollectionLoading] = useState(false);
  const [addToCollectionMessage, setAddToCollectionMessage] = useState<string | null>(null);
  const [artworkInCollections, setArtworkInCollections] = useState<Record<number, Collection[]>>({});

  const [pendingAuthor, setPendingAuthor] = useState<Set<string>>(new Set());
  const [pendingYearMin, setPendingYearMin] = useState<number>(0);
  const [pendingYearMax, setPendingYearMax] = useState<number>(2100);
  const [pendingMovement, setPendingMovement] = useState<Set<string>>(new Set());
  const [pendingTechnique, setPendingTechnique] = useState<Set<string>>(new Set());

  const [appliedAuthor, setAppliedAuthor] = useState<Set<string>>(new Set());
  const [appliedYearMin, setAppliedYearMin] = useState<number | null>(null);
  const [appliedYearMax, setAppliedYearMax] = useState<number | null>(null);
  const [appliedMovement, setAppliedMovement] = useState<Set<string>>(new Set());
  const [appliedTechnique, setAppliedTechnique] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  /** Debounce search: update searchFilter 250ms after user stops typing */
  useEffect(() => {
    const t = setTimeout(() => setSearchFilter(searchQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  /** Which year range input is on top (for dual-thumb slider); the one being dragged receives events. */
  const [yearRangeActive, setYearRangeActive] = useState<"min" | "max">("max");
  /** True once Choices.js has replaced the native selects (avoids flash of native options). */
  const [choicesReady, setChoicesReady] = useState(false);
  /** True once pending year has been synced with DB range (avoids slider showing full range for one frame). */
  const [yearRangeSynced, setYearRangeSynced] = useState(false);
  const yearSliderRef = useRef<HTMLDivElement>(null);
  const yearMinInputRef = useRef<HTMLInputElement>(null);
  const yearMaxInputRef = useRef<HTMLInputElement>(null);
  /** Durante arrastre: qué thumb se está moviendo (evita que ambos reciban el mismo valor en móvil). */
  const yearDragActiveRef = useRef<"min" | "max" | null>(null);
  /** Valores actuales del rango para usarlos en pointer move sin closure obsoleta. */
  const yearValuesRef = useRef({ min: 0, max: 2100 });
  useEffect(() => {
    yearValuesRef.current = {
      min: Math.min(pendingYearMin, pendingYearMax),
      max: Math.max(pendingYearMin, pendingYearMax),
    };
  }, [pendingYearMin, pendingYearMax]);

  const currentYearMin = Math.min(pendingYearMin, pendingYearMax);
  const currentYearMax = Math.max(pendingYearMin, pendingYearMax);

  const authorSelectRef = useRef<HTMLSelectElement>(null);
  const movementSelectRef = useRef<HTMLSelectElement>(null);
  const techniqueSelectRef = useRef<HTMLSelectElement>(null);
  const choicesRef = useRef<{
    author: ChoicesInstanceLike | null;
    movement: ChoicesInstanceLike | null;
    technique: ChoicesInstanceLike | null;
  }>({ author: null, movement: null, technique: null });

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

  const fetchInCollectionsForArtwork = useCallback((artworkId: number) => {
    fetch(`/api/artworks/${artworkId}/collections`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list: Collection[]) => setArtworkInCollections((prev) => ({ ...prev, [artworkId]: list })))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (addToCollectionArtworkId && session?.user) {
      fetch("/api/collections")
        .then((res) => (res.ok ? res.json() : []))
        .then(setCollections)
        .catch(() => setCollections([]));
    }
  }, [addToCollectionArtworkId, session?.user]);

  const uniqueAuthors = useMemo(() => [...new Set(artworks.map((a) => a.author).filter(Boolean))].sort(), [artworks]);
  const uniqueMovements = useMemo(() => [...new Set(artworks.map((a) => a.movement).filter(Boolean))].sort(), [artworks]);
  const uniqueTechniques = useMemo(() => [...new Set(artworks.map((a) => a.technique).filter(Boolean))].sort(), [artworks]);

  const { yearMinDb, yearMaxDb } = useMemo(() => {
    const parsed = artworks.map((a) => parseYear(a.year)).filter((n): n is number => n != null);
    if (parsed.length === 0) return { yearMinDb: 0, yearMaxDb: new Date().getFullYear() };
    return { yearMinDb: Math.min(...parsed), yearMaxDb: Math.max(...parsed) };
  }, [artworks]);

  /** Sync pending year range with DB range when data loads, or with applied filters when those change. */
  useEffect(() => {
    if (loading) return;
    setPendingYearMin(appliedYearMin ?? yearMinDb);
    setPendingYearMax(appliedYearMax ?? yearMaxDb);
    setYearRangeSynced(true);
  }, [loading, yearMinDb, yearMaxDb, appliedYearMin, appliedYearMax]);

  const filteredArtworks = useMemo(() => {
    return artworks.filter((a) => {
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        const titleMatch = (a.title ?? "").toLowerCase().includes(q);
        const authorMatch = (a.author ?? "").toLowerCase().includes(q);
        if (!titleMatch && !authorMatch) return false;
      }
      if (appliedAuthor.size > 0 && !appliedAuthor.has(a.author)) return false;
      if (appliedYearMin != null && appliedYearMax != null) {
        const y = parseYear(a.year);
        if (y != null && (y < appliedYearMin || y > appliedYearMax)) return false;
      }
      if (appliedMovement.size > 0 && !appliedMovement.has(a.movement)) return false;
      if (appliedTechnique.size > 0 && !appliedTechnique.has(a.technique)) return false;
      return true;
    });
  }, [artworks, searchFilter, appliedAuthor, appliedYearMin, appliedYearMax, appliedMovement, appliedTechnique]);

  const filteredArtworkIds = useMemo(() => filteredArtworks.map((a) => a.id).join(","), [filteredArtworks]);

  useEffect(() => {
    if (status !== "authenticated" || loading) return;
    filteredArtworks.forEach((a) => {
      fetch(`/api/artworks/${a.id}/collections`)
        .then((res) => (res.ok ? res.json() : []))
        .then((list: Collection[]) =>
          setArtworkInCollections((prev) => ({ ...prev, [a.id]: list }))
        )
        .catch(() => {});
    });
  }, [status, loading, filteredArtworkIds]);

  const applyFilters = useCallback(() => {
    setAppliedAuthor(new Set(pendingAuthor));
    setAppliedYearMin(pendingYearMin);
    setAppliedYearMax(pendingYearMax);
    setAppliedMovement(new Set(pendingMovement));
    setAppliedTechnique(new Set(pendingTechnique));
  }, [pendingAuthor, pendingYearMin, pendingYearMax, pendingMovement, pendingTechnique]);

  /** Convierte clientX en valor de año según la posición en el track del slider. */
  const clientXToYear = useCallback(
    (clientX: number) => {
      const container = yearSliderRef.current;
      if (!container) return yearMinDb;
      const rect = container.getBoundingClientRect();
      const trackLeft = rect.left + 10;
      const trackWidth = Math.max(1, rect.width - 20);
      const range = yearMaxDb - yearMinDb || 1;
      const pct = Math.max(0, Math.min(1, (clientX - trackLeft) / trackWidth));
      return Math.round(yearMinDb + pct * range);
    },
    [yearMinDb, yearMaxDb]
  );

  /** Pointer down: siempre tomamos el control; movemos solo el thumb más cercano al toque (evita 1491-1491 en móvil). */
  const onYearSliderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const container = yearSliderRef.current;
      const minInput = yearMinInputRef.current;
      const maxInput = yearMaxInputRef.current;
      if (!container || !minInput || !maxInput) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = container.getBoundingClientRect();
      const trackLeft = rect.left + 10;
      const trackWidth = Math.max(1, rect.width - 20);
      const range = yearMaxDb - yearMinDb || 1;
      const clickX = e.clientX;
      const yearAtClick = clientXToYear(clickX);
      const { min: currentMin, max: currentMax } = yearValuesRef.current;
      const minX = trackLeft + (trackWidth * (currentMin - yearMinDb)) / range;
      const maxX = trackLeft + (trackWidth * (currentMax - yearMinDb)) / range;
      const mid = (minX + maxX) / 2;
      const useMin = clickX <= mid;
      setYearRangeActive(useMin ? "min" : "max");
      yearDragActiveRef.current = useMin ? "min" : "max";
      if (useMin) {
        const newMin = Math.max(yearMinDb, Math.min(yearAtClick, currentMax));
        setPendingYearMin(newMin);
      } else {
        const newMax = Math.min(yearMaxDb, Math.max(yearAtClick, currentMin));
        setPendingYearMax(newMax);
      }
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [yearMinDb, yearMaxDb, clientXToYear]
  );

  const onYearSliderPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (yearDragActiveRef.current === null) return;
      const { min: currentMin, max: currentMax } = yearValuesRef.current;
      const year = clientXToYear(e.clientX);
      if (yearDragActiveRef.current === "min") {
        const newMin = Math.max(yearMinDb, Math.min(year, currentMax));
        setPendingYearMin(newMin);
      } else {
        const newMax = Math.min(yearMaxDb, Math.max(year, currentMin));
        setPendingYearMax(newMax);
      }
    },
    [yearMinDb, yearMaxDb, clientXToYear]
  );

  const onYearSliderPointerUp = useCallback((e: React.PointerEvent) => {
    if (yearDragActiveRef.current !== null) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      yearDragActiveRef.current = null;
    }
  }, []);

  const clearFilters = useCallback(() => {
    const empty = new Set<string>();
    [choicesRef.current.author, choicesRef.current.movement, choicesRef.current.technique].forEach((c) => {
      c?.removeActiveItems?.();
    });
    setSearchQuery("");
    setSearchFilter("");
    setPendingAuthor(empty);
    setPendingYearMin(yearMinDb);
    setPendingYearMax(yearMaxDb);
    setPendingMovement(empty);
    setPendingTechnique(empty);
    setAppliedAuthor(empty);
    setAppliedYearMin(null);
    setAppliedYearMax(null);
    setAppliedMovement(empty);
    setAppliedTechnique(empty);
  }, [yearMinDb, yearMaxDb]);

  // Init Choices.js when options are ready (dynamic import so it only runs in browser)
  useEffect(() => {
    if (typeof document === "undefined" || loading) return;
    const opts = {
      searchEnabled: true,
      removeItemButton: true,
      placeholderValue: "Select…",
      noChoicesText: "No options",
      itemSelectText: "",
    };
    const syncFromChoices = () => {
      const a = choicesRef.current.author?.getValue(true);
      const m = choicesRef.current.movement?.getValue(true);
      const t = choicesRef.current.technique?.getValue(true);
      if (Array.isArray(a)) setPendingAuthor(new Set(a));
      if (Array.isArray(m)) setPendingMovement(new Set(m));
      if (Array.isArray(t)) setPendingTechnique(new Set(t));
    };
    let cancelled = false;
    Promise.all([
      import("choices.js"),
      // @ts-expect-error - CSS import has no type declarations
      import("choices.js/public/assets/styles/choices.css"),
    ]).then(([{ default: Choices }]) => {
      if (cancelled) return;
      if (authorSelectRef.current && !choicesRef.current.author) {
        const c = new Choices(authorSelectRef.current, { ...opts });
        choicesRef.current.author = c as ChoicesInstanceLike;
        c.passedElement.element.addEventListener("change", syncFromChoices);
      }
      if (movementSelectRef.current && !choicesRef.current.movement) {
        const c = new Choices(movementSelectRef.current, { ...opts });
        choicesRef.current.movement = c as ChoicesInstanceLike;
        c.passedElement.element.addEventListener("change", syncFromChoices);
      }
      if (techniqueSelectRef.current && !choicesRef.current.technique) {
        const c = new Choices(techniqueSelectRef.current, { ...opts });
        choicesRef.current.technique = c as ChoicesInstanceLike;
        c.passedElement.element.addEventListener("change", syncFromChoices);
      }
      choicesRef.current.author?.setChoiceByValue(Array.from(appliedAuthor));
      choicesRef.current.movement?.setChoiceByValue(Array.from(appliedMovement));
      choicesRef.current.technique?.setChoiceByValue(Array.from(appliedTechnique));
      setChoicesReady(true);
    });
    return () => {
      cancelled = true;
      setChoicesReady(false);
      choicesRef.current.author?.destroy();
      choicesRef.current.movement?.destroy();
      choicesRef.current.technique?.destroy();
      choicesRef.current.author = null;
      choicesRef.current.movement = null;
      choicesRef.current.technique = null;
    };
  }, [loading, uniqueAuthors.length, uniqueMovements.length, uniqueTechniques.length, appliedAuthor, appliedMovement, appliedTechnique]);

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
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-(--spacing-lg) font-(--font-family-heading) text-4xl md:text-[3rem]">
            Gallery
          </h1>
          <p className="mx-auto my-0 max-w-3xl text-lg text-(--muted-foreground)">
            Browse all artworks and filter by author, movement, year or technique.
          </p>
        </div>
      </section>

      {/* Apply filters / Clear filters and filter panel */}
      <section className="bg-white py-(--spacing-lg)">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-4">
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

          <div className="mt-(--spacing-lg) rounded-none bg-[#f5f5f0] p-(--spacing-lg) shadow-sm">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="col-span-full">
                  <label htmlFor="filter-search" className="mb-2 block font-(--font-family-heading) text-[15px] text-[#1a1a1a]">
                    Search by title or author
                  </label>
                  <input
                    id="filter-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to search…"
                    className="w-full border border-(--border) bg-(--background) px-4 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                    aria-label="Search by title or author"
                  />
                </div>
                <div>
                  <label htmlFor="filter-author" className="mb-2 block font-(--font-family-heading) text-[15px] text-[#1a1a1a]">
                    Author
                  </label>
                  <div className="relative min-h-10">
                    {!choicesReady && (
                      <div className="absolute inset-0 flex items-center rounded border border-(--border) bg-(--background) px-3 text-sm text-(--muted-foreground)">
                        Select…
                      </div>
                    )}
                    <select
                      id="filter-author"
                      ref={authorSelectRef}
                      multiple
                      className={`w-full border border-(--border) bg-(--background) text-(--foreground) ${choicesReady ? "" : "absolute inset-0 opacity-0 pointer-events-none"}`}
                      aria-label="Filter by author"
                    >
                      {uniqueAuthors.map((author) => (
                        <option key={author} value={author}>
                          {author}
                        </option>
                    ))}
                  </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="filter-movement" className="mb-2 block font-(--font-family-heading) text-[15px] text-[#1a1a1a]">
                    Movement
                  </label>
                  <div className="relative min-h-10">
                    {!choicesReady && (
                      <div className="absolute inset-0 flex items-center rounded border border-(--border) bg-(--background) px-3 text-sm text-(--muted-foreground)">
                        Select…
                      </div>
                    )}
                    <select
                      id="filter-movement"
                      ref={movementSelectRef}
                      multiple
                      className={`w-full border border-(--border) bg-(--background) text-(--foreground) ${choicesReady ? "" : "absolute inset-0 opacity-0 pointer-events-none"}`}
                      aria-label="Filter by movement"
                    >
                      {uniqueMovements.map((movement) => (
                        <option key={movement} value={movement}>
                          {movement}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block font-(--font-family-heading) text-[15px] text-[#1a1a1a]">
                    Year
                  </label>
                  {yearRangeSynced ? (
                    <>
                      <div
                        ref={yearSliderRef}
                        className="year-range-slider relative h-8 w-full touch-none select-none"
                        style={{ ["--year-min" as string]: yearMinDb, ["--year-max" as string]: yearMaxDb }}
                        onPointerDownCapture={onYearSliderPointerDown}
                        onPointerMove={onYearSliderPointerMove}
                        onPointerUp={onYearSliderPointerUp}
                        onPointerCancel={onYearSliderPointerUp}
                      >
                        <div className="absolute left-[10px] right-[10px] top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-(--muted)" />
                        <div
                          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-(--primary) pointer-events-none"
                          style={(() => {
                            const range = yearMaxDb - yearMinDb || 1;
                            const pctMin = ((Math.min(pendingYearMin, pendingYearMax) - yearMinDb) / range) * 100;
                            const pctWidth = ((Math.max(pendingYearMin, pendingYearMax) - Math.min(pendingYearMin, pendingYearMax)) / range) * 100;
                            return {
                              left: `calc(10px + (100% - 20px) * ${pctMin / 100})`,
                              width: `calc((100% - 20px) * ${pctWidth / 100})`,
                            };
                          })()}
                        />
                        <label className="sr-only" htmlFor="filter-year-min">From year</label>
                        <input
                          ref={yearMinInputRef}
                          id="filter-year-min"
                          type="range"
                          min={yearMinDb}
                          max={yearMaxDb}
                          value={Math.min(pendingYearMin, pendingYearMax)}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            setPendingYearMin(v);
                            if (v > pendingYearMax) setPendingYearMax(v);
                          }}
                          className={`year-range-input pointer-events-none absolute left-[10px] right-[10px] top-0 h-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-(--primary) [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-runnable-track]:h-5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent ${yearRangeActive === "min" ? "z-10" : "z-0"}`}
                          aria-label="From year"
                        />
                        <label className="sr-only" htmlFor="filter-year-max">To year</label>
                        <input
                          ref={yearMaxInputRef}
                          id="filter-year-max"
                          type="range"
                          min={yearMinDb}
                          max={yearMaxDb}
                          value={Math.max(pendingYearMin, pendingYearMax)}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            setPendingYearMax(v);
                            if (v < pendingYearMin) setPendingYearMin(v);
                          }}
                          className={`year-range-input pointer-events-none absolute left-[10px] right-[10px] top-0 h-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-(--primary) [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-runnable-track]:h-5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent ${yearRangeActive === "max" ? "z-10" : "z-0"}`}
                          aria-label="To year"
                        />
                      </div>
                      <p className="mt-1 text-xs text-(--muted-foreground)">
                        Range: {currentYearMin} – {currentYearMax}
                      </p>
                    </>
                  ) : (
                    <div className="flex h-8 min-h-10 items-center rounded border border-(--border) bg-(--background) px-3 text-sm text-(--muted-foreground)">
                      Select…
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="filter-technique" className="mb-2 block font-(--font-family-heading) text-[15px] text-[#1a1a1a]">
                    Technique
                  </label>
                  <div className="relative min-h-10">
                    {!choicesReady && (
                      <div className="absolute inset-0 flex items-center rounded border border-(--border) bg-(--background) px-3 text-sm text-(--muted-foreground)">
                        Select…
                      </div>
                    )}
                    <select
                      id="filter-technique"
                      ref={techniqueSelectRef}
                      multiple
                      className={`w-full border border-(--border) bg-(--background) text-(--foreground) ${choicesReady ? "" : "absolute inset-0 opacity-0 pointer-events-none"}`}
                      aria-label="Filter by technique"
                    >
                      {uniqueTechniques.map((technique) => (
                        <option key={technique} value={technique}>
                          {technique}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </section>

      <section className="py-(--spacing-xl) sm:py-(--spacing-2xl)">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-(--spacing-xl) sm:grid-cols-2 lg:grid-cols-3">
            {filteredArtworks.map((artwork) => {
              const inCols = artworkInCollections[artwork.id] ?? [];
              const isInCollection = inCols.length > 0;
              return (
                <article key={artwork.id} className="group relative block border border-[#afafaf80] bg-(--card) transition-shadow duration-(--transition-normal) hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                  <Link href={`/artwork/${artwork.id}`} className="block">
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
                    </div>
                  </Link>
                  {status === "authenticated" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setAddToCollectionMessage(null);
                        setAddToCollectionArtworkId(artwork.id);
                      }}
                      className="absolute bottom-(--spacing-lg) right-(--spacing-lg) flex h-8 w-8 items-center justify-center bg-(--foreground) text-(--background) transition-opacity duration-(--transition-fast) hover:opacity-80"
                      aria-label={isInCollection ? "In your collection" : "Add to my collection"}
                    >
                      {isInCollection ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden>
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      )}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
          {filteredArtworks.length === 0 && (
            <p className="py-(--spacing-2xl) text-center font-(--font-family-heading) text-(--muted-foreground)">
              No artworks match the current filters.
            </p>
          )}
        </div>

        {/* Add to collection modal (same behaviour as /artwork/[id]) */}
        {addToCollectionArtworkId != null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setAddToCollectionArtworkId(null)}
          >
            <div
              className="w-full max-w-md rounded-none border border-(--border) bg-(--card) p-(--spacing-xl) shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-(--font-family-heading) text-xl">Add to collection</h3>
                <button
                  type="button"
                  className="text-(--muted-foreground) hover:text-(--foreground)"
                  onClick={() => setAddToCollectionArtworkId(null)}
                  aria-label="Close"
                >
                  ×
                </button>
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
                  {addToCollectionMessage && (
                    <p className={`mb-2 text-sm ${addToCollectionMessage.startsWith("Added") ? "text-green-600" : "text-red-600"}`}>
                      {addToCollectionMessage}
                    </p>
                  )}
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
                              body: JSON.stringify({ artwork_id: addToCollectionArtworkId }),
                            });
                            const data = await res.json().catch(() => ({}));
                            setAddToCollectionLoading(false);
                            if (res.ok) {
                              setAddToCollectionMessage("Added to " + col.name);
                              fetchInCollectionsForArtwork(addToCollectionArtworkId);
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
      </section>
    </>
  );
}
