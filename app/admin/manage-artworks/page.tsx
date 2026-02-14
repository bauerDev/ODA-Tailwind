"use client";

import { useEffect, useState } from "react";

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

  const openAdd = () => {
    setForm(emptyArtwork);
    setEditingId(null);
    setShowForm(true);
  };

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
      alert("Error al guardar la obra");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta obra?")) return;
    try {
      const res = await fetch(`/api/artworks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      loadArtworks();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la obra");
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
              + Añadir obra
            </button>
          </div>

          <div className="border border-(--border) overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div
                  className="h-10 w-10 animate-spin rounded-full border-4 border-(--muted-foreground) border-t-(--primary)"
                  aria-label="Cargando"
                />
              </div>
            ) : (
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
                            title="Editar"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="bg-red-600 text-white px-2 py-1 text-sm hover:opacity-90"
                            title="Eliminar"
                          >
                            Eliminar
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
                No hay obras. Añade una con el botón «Añadir obra».
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
              {editingId ? "Editar obra" : "Añadir obra"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Autor *</label>
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
                  <label className="block text-sm mb-1">Año</label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Movimiento</label>
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
                  <label className="block text-sm mb-1">Técnica</label>
                  <input
                    type="text"
                    value={form.technique}
                    onChange={(e) => setForm({ ...form, technique: e.target.value })}
                    className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Dimensiones</label>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                    className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Ubicación</label>
                <input
                  type="text"
                  value={form.ubication}
                  onChange={(e) => setForm({ ...form, ubication: e.target.value })}
                  className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">URL de imagen *</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full border border-(--border) px-3 py-2 bg-(--background) text-(--foreground)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Descripción</label>
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
                  {editingId ? "Guardar cambios" : "Añadir obra"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="border border-(--border) px-(--spacing-lg) py-(--spacing-sm) hover:bg-(--muted)"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
