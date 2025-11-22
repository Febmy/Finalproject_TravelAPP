// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function AdminUsers() {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET semua user
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/all-user"); // ✅ endpoint list user
      const data = res.data?.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Admin users error:", err.response?.data || err.message);
      const msg = "Gagal memuat daftar user.";
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

      // ✅ endpoint update role
      await api.post(`/update-user-role/${id}`, { role: newRole });

      showToast({
        type: "success",
        message: "Role user berhasil diupdate.",
      });

      // update state lokal biar langsung kelihatan
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Update role error:", err.response?.data || err.message);
      showToast({
        type: "error",
        message: "Gagal mengubah role. Coba lagi.",
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout title="User Management">
      {/* Container tengah, lebar dibatasi */}
      <div className="max-w-4xl mx-auto w-full">
        {/* STATE: loading */}
        {loading && !error && (
          <p className="text-sm text-slate-500">Memuat daftar user...</p>
        )}

        {/* STATE: error */}
        {error && (
          <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* STATE: sukses */}
        {!loading && !error && (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {user.name || "-"}
                  </p>
                  <p className="text-xs text-slate-500">{user.email || "-"}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-900 text-white uppercase tracking-[0.16em]">
                    {user.role || "user"}
                  </span>

                  <select
                    value={user.role || "user"}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    disabled={savingId === user.id}
                    className="text-xs md:text-sm border border-slate-300 rounded-full px-3 py-1 bg-white"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <p className="text-sm text-slate-500">
                Belum ada user yang terdaftar.
              </p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
