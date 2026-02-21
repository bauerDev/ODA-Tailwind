"use client";

import { useEffect, useState } from "react";
import UploadImage from "@/components/UploadImage";

/** Artwork structure (matches the artworks table in the DB) */
interface Artwork {
  id: number;
  title: string;
  author: string;
  year: string;
  movement: string;
  technique: string;
  dimensions: string;
  ubication?: string;
  location?: string;
  image: string;
  description: string;
}

/** Empty initial values for the add-artwork form */
const emptyArtwork: Omit<Artwork, "id"> = {
  title: "",
  author: "",
  year: "",
  movement: "",
  technique: "",
  dimensions: "",
  ubication: "",
  image: "",
  description: "",
};

export default function ManageArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyArtwork);

  /** Fetches all artworks from the API */
  const loadArtworks = () => {
    setLoading(true);
    fetch("/api/artworks")
      .then((res) => res.json())
      .then((data) => {
        setArtworks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadArtworks();
  }, []);

  const getLocation = (a: Artwork) => a.ubication ?? a.location ?? "";

  /** Opens the modal to add a new artwork (empty form) */
  const openAdd = () => {
    setForm(emptyArtwork);
    setEditingId(null);
    setShowForm(true);
  };

  /** Opens the modal to edit an existing artwork (prefills form) */
  const openEdit = (a: Artwork) => {
    setForm({
      title: a.title,
      author: a.author,
      year: a.year ?? "",
      movement: a.movement ?? "",
      technique: a.technique ?? "",
      dimensions: a.dimensions ?? "",
      ubication: getLocation(a),
      image: a.image,
      description: a.description ?? "",
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  /** Submits the form: POST for new artwork, PUT for edit; then reloads the list */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, ubication: form.ubication ?? "" };
    try {
      if (editingId) {
        const res = await fetch(`/api/artworks/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch("/api/artworks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      }
      closeForm();
      loadArtworks();
    } catch (err) {
      console.error(err);
      alert("Error saving artwork");
    }
  };

  /** Deletes an artwork by ID; asks for confirmation and reloads the list */
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this artwork?")) return;
    try {
      const res = await fetch(`/api/artworks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      loadArtworks();
    } catch (err) {
      console.error(err);
      alert("Error deleting artwork");
    }
  };

  return (
    <>
      <section className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-[1280px] mx-auto">
          <h1 className="text-4xl font-(--font-family-heading) text-(--foreground) mb-(--spacing-xl) text-center">
            Manage Artworks
          </h1>
          <p className="text-lg text-(--muted-foreground) mb-(--spacing-xl) text-center">
            Add, edit or delete artworks
          </p>

          <div className="mb-(--spacing-lg) flex justify-end">
            <button
              onClick={openAdd}
              className="bg-(--primary) text-(--primary-foreground) px-(--spacing-lg) py-(--spacing-sm) font-(--font-family-heading) transition-opacity hover:opacity-90"
            >
              + Add artwork
            </button>
          </div>

          {/* Table container: spinner when loading, table or empty message */}
          <div className="border border-(--border) overflow-x-auto">
            {loading ? (
              /* Loading spinner */
              <div className="flex items-center justify-center py-16">
                <div
                  className="h-10 w-10 animate-spin rounded-full border-4 border-(--muted-foreground) border-t-(--primary)"
                  aria-label="Loading"
                />
              </div>
            ) : (
              /* Table with artwork columns and actions */
              <table className="w-full min-w-[800px] border-collapse text-(--foreground) bg-white">
                <thead>
                  <tr className="bg-(--muted) text-(--foreground)">
                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">
                      Author
                    </th>
                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">
                      Year
                    </th>
                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">
                      Movement
                    </th>
                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">
                      Technique
                    </th>
                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">
                      Dimensions
                    </th>
                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-b border-(--border)">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white [&>tr:hover]:bg-(--muted) [&_td]:px-4 [&_td]:py-3 [&_td]:text-(--foreground) [&_td]:border-r [&_td]:border-b [&_td]:border-(--border)">
                  {artworks.map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td className="max-w-[120px] truncate">{a.title}</td>
                      <td>{a.author}</td>
                      <td>{a.year}</td>
                      <td className="max-w-[100px] truncate">{a.movement}</td>
                      <td className="max-w-[100px] truncate">{a.technique}</td>
                      <td className="max-w-[80px] truncate">{a.dimensions}</td>
                      <td className="max-w-[100px] truncate">{getLocation(a)}</td>
                      <td className="max-w-[150px] truncate">{a.description}</td>
                      <td>
                        {a.image ? (
                          <img
                            src={a.image}
                            alt=""
                            className="h-10 w-10 object-cover border border-(--border)"
                          />
                        ) : (
                          <span className="text-(--muted-foreground)">—</span>
                        )}
                      </td>
                      <td className="border-r-0">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(a)}
                            className="bg-(--primary) text-(--primary-foreground) px-2 py-1 text-sm hover:opacity-90"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="bg-red-600 text-white px-2 py-1 text-sm hover:opacity-90"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && artworks.length === 0 && (
              <p className="py-8 text-center text-(--muted-foreground)">
                No artworks. Add one with the «Add artwork» button.
              </p>
            )}
          </div>
        </div>
      </section>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={closeForm}
        >
          <div
            className="bg-(--background) border border-(--border) max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-(--spacing-xl)"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-(--font-family-heading) mb-(--spacing-lg)">
              {editingId ? "Edit artwork" : "Add artwork"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Author *</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Year</label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Movement</label>
                  <input
                    type="text"
                    value={form.movement}
                    onChange={(e) => setForm({ ...form, movement: e.target.value })}
                    className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Technique</label>
                  <input
                    type="text"
                    value={form.technique}
                    onChange={(e) => setForm({ ...form, technique: e.target.value })}
                    className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                    className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Location</label>
                <input
                  type="text"
                  value={form.ubication}
                  onChange={(e) => setForm({ ...form, ubication: e.target.value })}
                  className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Upload image</label>
                <UploadImage
                  embedded
                  onUploadComplete={(url) => setForm((f) => ({ ...f, image: url }))}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Image URL *</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="bg-(--primary) text-(--primary-foreground) px-(--spacing-lg) py-(--spacing-sm) hover:opacity-90"
                >
                  {editingId ? "Save changes" : "Add artwork"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="border border-(--border) px-(--spacing-lg) py-(--spacing-sm) hover:bg-(--muted)"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
