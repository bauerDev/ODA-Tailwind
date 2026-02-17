'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type Collection = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  visibility: string;
  created_at: string;
};

export default function MiColeccion() {
  const { data: session, status } = useSession();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async () => {
    const res = await fetch('/api/collections');
    if (res.ok) {
      const data = await res.json();
      setCollections(data);
    } else {
      setCollections([]);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false);
      setCollections([]);
      return;
    }
    if (status === 'authenticated') {
      fetchCollections().finally(() => setLoading(false));
    }
  }, [status]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  async function handleCreateCollection(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get('nombre') as string)?.trim();
    const description = (formData.get('descripcion') as string)?.trim() || null;
    const visibility = (formData.get('visibilidad') as string) === 'publica' ? 'publica' : 'privada';
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, visibility }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to create collection');
        return;
      }
      await fetchCollections();
      closeModal();
      form.reset();
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-(--muted) border-t-(--primary)" aria-hidden />
      </div>
    );
  }

  if (!session) {
    return (
      <section className="py-(--spacing-3xl)">
        <div className="mx-auto max-w-[1280px] px-4 text-center">
          <h1 className="mb-(--spacing-lg) font-(--font-family-heading) text-4xl">My Collection</h1>
          <p className="text-(--muted-foreground)">Sign in to create and manage your collections.</p>
          <Link href="/login" className="mt-4 inline-block bg-(--primary) px-4 py-2 text-(--primary-foreground)">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-(--card) py-(--spacing-2xl)">
        <div className="mx-auto w-full max-w-[1280px] px-4">
          <div className="text-center">
            <h1 className="mb-(--spacing-lg) font-(--font-family-heading) text-4xl md:text-[3rem]">My Collection</h1>
            <p className="mx-auto max-w-3xl text-lg text-(--muted-foreground)">
              Create and manage your personalized collections of artworks.
              Organize your favorites by theme, period, or any criteria you prefer.
            </p>
          </div>
        </div>
      </section>

      <section className="py-(--spacing-3xl)">
        <div className="mx-auto w-full max-w-[1280px] px-4">
          <div className="mb-(--spacing-3xl) rounded-lg border-2 border-dashed border-(--border) bg-(--card) p-(--spacing-3xl) text-center transition-all duration-200 hover:border-(--primary) hover:bg-[rgba(102,20,20,0.02)]">
            <div className="mx-auto max-w-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-(--spacing-lg) h-12 w-12 text-(--primary)">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <h2 className="mb-(--spacing-md) font-(--font-family-heading) text-2xl">Create a collection</h2>
              <p className="mb-(--spacing-xl) leading-relaxed text-(--muted-foreground)">
                Organize your favorite artworks into personalized thematic collections.
              </p>
              <button type="button" className="cursor-pointer rounded-md bg-(--primary) px-(--spacing-2xl) py-(--spacing-md) font-(--font-family-heading) text-lg text-(--primary-foreground) transition-all duration-200 hover:opacity-90" onClick={openModal}>
                Create collection
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-(--spacing-xl) sm:grid-cols-2 lg:grid-cols-3">
            {collections.length === 0 ? (
              <div className="col-span-full rounded-lg border border-(--border) bg-(--card) px-(--spacing-xl) py-(--spacing-4xl) text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-(--spacing-lg) h-16 w-16 text-(--muted-foreground) opacity-50">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p className="mb-(--spacing-sm) font-(--font-family-heading) text-lg text-(--foreground)">
                  You haven&apos;t created any collections yet
                </p>
                <p className="text-sm text-(--muted-foreground)">
                  Click &quot;Create collection&quot; to get started
                </p>
              </div>
            ) : (
              collections.map((col) => (
                <Link
                  key={col.id}
                  href={`/my-collection/${col.id}`}
                  className="flex flex-col rounded-lg border border-(--border) bg-(--card) p-(--spacing-xl) transition-all duration-200 hover:border-(--primary) hover:shadow-md"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-(--primary)">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <h3 className="font-(--font-family-heading) text-lg text-(--foreground)">{col.name}</h3>
                  </div>
                  {col.description && (
                    <p className="line-clamp-2 text-sm text-(--muted-foreground)">{col.description}</p>
                  )}
                  <span className="mt-2 text-xs text-(--muted-foreground)">{col.visibility === 'publica' ? 'Public' : 'Private'}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-(--spacing-lg)" onClick={closeModal}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-(--card) shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-(--border) p-(--spacing-xl)">
              <h2 className="font-(--font-family-heading) text-2xl">Create new collection</h2>
              <button type="button" className="flex cursor-pointer items-center justify-center border-0 bg-transparent p-(--spacing-xs) text-(--muted-foreground) hover:text-(--foreground)" onClick={closeModal} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form className="flex flex-col gap-(--spacing-lg) p-(--spacing-xl)" onSubmit={handleCreateCollection}>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex flex-col">
                <label htmlFor="collection-name" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">Collection name *</label>
                <input type="text" id="collection-name" name="nombre" className="w-full border border-(--border) bg-(--card) px-4 py-2 text-(--foreground) outline-none focus:border-(--primary)" placeholder="E.g.: Renaissance Works" required />
              </div>
              <div className="flex flex-col">
                <label htmlFor="collection-description" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">Description</label>
                <textarea id="collection-description" name="descripcion" rows={4} className="min-h-[100px] w-full resize-y border border-(--border) bg-(--card) px-4 py-2 text-(--foreground) outline-none focus:border-(--primary)" placeholder="Describe the theme or purpose of your collection..." />
              </div>
              <div className="flex flex-col">
                <label htmlFor="collection-visibility" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">Visibility</label>
                <select id="collection-visibility" name="visibilidad" className="w-full border border-(--border) bg-(--card) px-4 py-2 text-(--foreground) outline-none focus:border-(--primary)">
                  <option value="privada">Private (only you can see it)</option>
                  <option value="publica">Public (visible to everyone)</option>
                </select>
              </div>
              <div className="flex gap-(--spacing-md) pt-(--spacing-md)">
                <button type="button" className="flex-1 cursor-pointer rounded-md border border-(--border) bg-transparent px-(--spacing-lg) py-(--spacing-sm) font-(--font-family-heading) text-(--foreground) hover:bg-(--muted)" onClick={closeModal}>Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 cursor-pointer rounded-md border-0 bg-(--primary) px-(--spacing-lg) py-(--spacing-sm) font-(--font-family-heading) text-(--primary-foreground) hover:opacity-90 disabled:opacity-50">
                  {submitting ? 'Creating…' : 'Create collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
