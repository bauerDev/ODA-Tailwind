"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type UserRow = {
  id: number;
  email: string;
  name: string | null;
  user_type: string;
  institution: string | null;
  is_admin: boolean;
  created_at: string;
};

export default function ManageUsers() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const highlightId = searchParams?.get("userId") || null;
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadUsers = () => {
    fetch("/api/admin/users")
      .then((res) => (res.ok ? res.json() : []))
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!highlightId || users.length === 0) return;
    const el = document.getElementById(`user-${highlightId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, users]);

  const roleLabel = (user_type: string) =>
    user_type === "docente" ? "Teacher" : user_type === "alumno" ? "Student" : user_type;

  const handleDelete = async (u: UserRow) => {
    if (!confirm(`Delete user "${u.name ?? u.email}"? This will also remove their collections.`)) return;
    setDeletingId(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete user");
        return;
      }
      loadUsers();
    } catch {
      alert("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const currentUserId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[1280px] mx-auto">
        <h1 className="text-4xl font-(--font-family-heading) text-(--foreground) mb-(--spacing-xl) text-center">Manage Users</h1>
        <p className="text-lg text-(--muted-foreground) mb-(--spacing-2xl) text-center">All users in the database</p>
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
                  <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Email</th>
                  <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Type</th>
                  <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Institution</th>
                  <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Admin</th>
                  <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-b border-(--border)">Actions</th>
                </tr>
              </thead>
              <tbody className="[&>tr:hover]:bg-(--muted) [&_td]:px-4 [&_td]:py-3 [&_td]:text-(--foreground) [&_td]:border-r [&_td]:border-b [&_td]:border-(--border)">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-(--muted-foreground)">No users found</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      id={`user-${u.id}`}
                      className={highlightId === String(u.id) ? "bg-(--primary)/10" : ""}
                    >
                      <td>{u.id}</td>
                      <td>{u.name ?? "—"}</td>
                      <td>{u.email}</td>
                      <td>{roleLabel(u.user_type)}</td>
                      <td>{u.institution ?? "—"}</td>
                      <td>{u.is_admin ? "Yes" : "No"}</td>
                      <td className="border-r-0">
                        <button
                          type="button"
                          disabled={deletingId === u.id || currentUserId === u.id}
                          onClick={() => handleDelete(u)}
                          className="bg-red-600 text-white px-2 py-1 text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={currentUserId === u.id ? "You cannot delete yourself" : "Delete user"}
                        >
                          {deletingId === u.id ? "…" : "Delete"}
                        </button>
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
