// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDateTime } from "../../lib/format.js";
import { getFriendlyErrorMessage } from "../../lib/errors.js";

const PAGE_SIZE = 8;

// helper untuk ambil waktu user (dipakai buat sorting terbaru duluan)
function getUserTime(user) {
  const d =
    user.createdAt ||
    user.updatedAt ||
    user.created_at ||
    user.updated_at ||
    null;

  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export default function AdminUsers() {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // 🔎 search

  // GET semua user
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/all-user"); // endpoint list user
      const data = res.data?.data || [];

      const normalized = Array.isArray(data) ? data : [];
      // sort dari user terbaru
      normalized.sort((a, b) => getUserTime(b) - getUserTime(a));

      setUsers(normalized);
      setCurrentPage(1); // setiap reload balik ke page 1
    } catch (err) {
      console.error("Admin users error:", err.response?.data || err.message);
      const msg = getFriendlyErrorMessage(err, "Gagal memuat daftar user.");
      setError(msg);
      showToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Ubah role user
  const handleChangeRole = async (id, newRole) => {
    if (!id) return;

    const ok = window.confirm(`Ubah role user ini menjadi "${newRole}"?`);
    if (!ok) return;

    try {
      setSavingId(id);

      // endpoint update role
      await api.post(`/update-user-role/${id}`, { role: newRole });

      showToast({
        type: "success",
        message: "Role user berhasil diupdate.",
      });

      // update state lokal + tetap jaga urutan terbaru duluan
      setUsers((prev) => {
        const updated = prev.map((u) =>
          u.id === id ? { ...u, role: newRole } : u
        );
        return [...updated].sort((a, b) => getUserTime(b) - getUserTime(a));
      });
    } catch (err) {
      console.error("Update role error:", err.response?.data || err.message);
      const msg = getFriendlyErrorMessage(
        err,
        "Gagal mengubah role user. Coba lagi."
      );
      showToast({
        type: "error",
        message: msg,
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // tiap ganti search balik ke page 1
  };

  // ===== SORTING + FILTER + PAGINATION =====
  const q = searchTerm.trim().toLowerCase();

  // filter berdasarkan nama / email
  const filteredUsers = users.filter((u) => {
    if (!q) return true;
    const name = (u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const totalUsers = filteredUsers.length;
  const totalPages = totalUsers > 0 ? Math.ceil(totalUsers / PAGE_SIZE) : 1;
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * PAGE_SIZE;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePrev = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNext = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <AdminLayout title="User Management">
      <div className="max-w-4xl mx-auto w-full">
        {/* STATE: loading */}
        {loading && !error && (
          <p className="text-sm text-slate-500 mb-2">Memuat daftar user...</p>
        )}

        {/* STATE: error */}
        {error && (
          <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs md:text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STATE: sukses */}
        {!loading && !error && (
          <div className="space-y-3">
            {/* Search + info jumlah */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-1">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Cari nama atau email..."
                className="w-full md:w-64 px-3 py-1.5 text-xs md:text-sm rounded-full border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />

              {totalUsers > 0 && (
                <p className="text-[11px] text-slate-500">
                  Menampilkan{" "}
                  <span className="font-medium">
                    {startIndex + 1}-
                    {Math.min(startIndex + PAGE_SIZE, totalUsers)}
                  </span>{" "}
                  dari <span className="font-medium">{totalUsers}</span> user
                  {q && (
                    <>
                      {" "}
                      (hasil pencarian: &quot;
                      <span className="font-medium">{q}</span>&quot;)
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Summary kecil */}
            {totalUsers > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <p>
                  Menampilkan{" "}
                  <span className="font-medium">
                    {startIndex + 1}-
                    {Math.min(startIndex + PAGE_SIZE, totalUsers)}
                  </span>{" "}
                  dari <span className="font-medium">{totalUsers}</span> user
                  (urutan terbaru duluan).
                </p>
              </div>
            )}

            {/* LIST USER per halaman */}
            {currentUsers.map((user) => {
              const dateLabel =
                user.createdAt || user.updatedAt || user.created_at;
              return (
                <div
                  key={user.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.name || "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.email || "-"}
                    </p>
                    {dateLabel && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        Bergabung: {formatDateTime(dateLabel)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-900 text-white uppercase tracking-[0.16em]">
                      {user.role || "user"}
                    </span>

                    <select
                      value={user.role || "user"}
                      onChange={(e) =>
                        handleChangeRole(user.id, e.target.value)
                      }
                      disabled={savingId === user.id}
                      className="text-xs md:text-sm border border-slate-300 rounded-full px-3 py-1 bg-white"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                </div>
              );
            })}

            {totalUsers === 0 && (
              <p className="text-sm text-slate-500">
                Belum ada user yang terdaftar.
              </p>
            )}

            {/* PAGINATION */}
            {totalUsers > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-full border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  ← Prev
                </button>
                <p className="text-[11px] text-slate-500">
                  Page{" "}
                  <span className="font-medium">
                    {page} / {totalPages}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-full border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
