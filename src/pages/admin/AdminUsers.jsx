import { useEffect, useState } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/all-user");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Admin users error:", err.response?.data || err.message);
      setError("Gagal memuat daftar user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChangeRole = async (id, newRole) => {
    const ok = window.confirm(`Ubah role user ini menjadi "${newRole}"?`);
    if (!ok) return;

    try {
      setSavingId(id);
      await api.post(`/update-user-role/${id}`, { role: newRole });
      alert("Role user berhasil diupdate.");
      // update lokal
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Update role error:", err.response?.data || err.message);
      alert("Gagal mengubah role. Coba lagi.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout title="User Management">
      {loading && (
        <p className="text-sm text-slate-500">Memuat daftar user...</p>
      )}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

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
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-900 text-white uppercase tracking-[0.16em]">
                  {user.role || "user"}
                </span>

                <select
                  defaultValue={user.role || "user"}
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
    </AdminLayout>
  );
}
