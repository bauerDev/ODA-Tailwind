"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CollectionRow = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  visibility: string;
  created_at: string;
  user_email?: string;
};

export default function ManageCollections() {
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/collections")
      .then((res) => (res.ok ? res.json() : []))
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[1280px] mx-auto">
        <h1 className="text-4xl font-(--font-family-heading) text-(--foreground) mb-(--spacing-xl) text-center">Manage Collections</h1>
        <p className="text-lg text-(--muted-foreground) mb-(--spacing-2xl) text-center">All collections in the database</p>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-(--muted) border-t-(--primary)" aria-hidden />
          </div>
        ) : (
          <div className="border border-(--border) overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-(--foreground) bg-(--card)">
              <thead>
                <tr className="bg-(--muted)">
                  <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">ID</th>
                  <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Name</th>
                  <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Description</th>
                  <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Visibility</th>
                  <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">User ID</th>
                  <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">User email</th>
                  <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-b border-(--border)">Actions</th>
                </tr>
              </thead>
              <tbody className="[&>tr:hover]:bg-(--muted) [&_td]:px-4 [&_td]:py-3 [&_td]:text-(--foreground) [&_td]:border-r [&_td]:border-b [&_td]:border-(--border)">
                {collections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-(--muted-foreground)">No collections found</td>
                  </tr>
                ) : (
                  collections.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.name}</td>
                      <td className="max-w-[200px] truncate">{c.description ?? "—"}</td>
                      <td>{c.visibility === "publica" ? "Public" : "Private"}</td>
                      <td>{c.user_id}</td>
                      <td>{c.user_email ?? "—"}</td>
                      <td>
                        <Link
                          href={`/admin/manage-users?userId=${c.user_id}`}
                          className="text-(--primary) hover:underline"
                        >
                          View user
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
