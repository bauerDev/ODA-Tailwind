'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

type Artwork = {
  id: number;
  title: string;
  author: string;
  image: string;
  year?: string;
  movement?: string;
};

type CollectionWithArtworks = {
  collection: { id: number; name: string; description: string | null; visibility: string };
  artworks: Artwork[];
};

export default function CollectionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: session, status } = useSession();
  const [data, setData] = useState<CollectionWithArtworks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || status === 'unauthenticated') {
      setLoading(false);
      return;
    }
    if (status === 'authenticated') {
      fetch(`/api/collections/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Collection not found');
          return res.json();
        })
        .then(setData)
        .catch(() => setError('Collection not found'))
        .finally(() => setLoading(false));
    }
  }, [id, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-(--muted) border-t-(--primary)" aria-hidden />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-8 text-center">
        <p className="text-(--muted-foreground)">Sign in to view this collection.</p>
        <Link href="/login" className="mt-4 inline-block text-(--primary)">Sign in</Link>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-8 text-center">
        <p className="text-(--muted-foreground)">{error || 'Collection not found'}</p>
        <Link href="/my-collection" className="mt-4 inline-block text-(--primary)">← Back to My Collection</Link>
      </div>
    );
  }

  const { collection, artworks } = data;

  return (
    <>
      <div className="p-(--spacing-lg)">
        <Link href="/my-collection" className="inline-flex items-center gap-(--spacing-sm) text-(--foreground)">
          ← Back to My Collection
        </Link>
      </div>
      <section className="mx-auto w-full max-w-[1280px] px-4 pb-(--spacing-4xl)">
        <h1 className="mb-2 font-(--font-family-heading) text-3xl text-(--foreground)">{collection.name}</h1>
        {collection.description && (
          <p className="mb-(--spacing-xl) text-(--muted-foreground)">{collection.description}</p>
        )}
        {artworks.length === 0 ? (
          <div className="rounded-none border border-(--border) bg-(--card) py-(--spacing-4xl) text-center">
            <p className="text-(--muted-foreground)">No artworks in this collection yet.</p>
            <p className="mt-2 text-sm text-(--muted-foreground)">Add artworks from the gallery or artwork detail page.</p>
            <Link href="/gallery" className="mt-4 inline-block text-(--primary)">Browse gallery</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-(--spacing-xl) sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => (
              <Link key={artwork.id} href={`/artwork/${artwork.id}`} className="group block overflow-hidden rounded-none border border-(--border) bg-(--card) transition hover:shadow-md">
                <div className="aspect-4/3 overflow-hidden bg-(--muted)">
                  <img src={artwork.image} alt={artwork.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                </div>
                <div className="p-(--spacing-md)">
                  <h3 className="font-(--font-family-heading) text-(--foreground)">{artwork.title}</h3>
                  <p className="text-sm text-(--muted-foreground)">{artwork.author}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
