// src/pages/admin/AdminActivities.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import AdminLayout from "../../components/AdminLayout.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const initialForm = {
  title: "",
  description: "",
  city: "",
  price: "",
  imageUrl: "",
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function getSafeImageUrl(url, fallback) {
  if (!url) return fallback;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url;
    }
  } catch {
    // url tidak valid → pakai fallback
  }
  return fallback;
}

export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const { showToast } = useToast();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get("/activities?limit=100");
      setActivities(res.data.data || []);
    } catch (err) {
      console.error(
        "Admin activities error:",
        err.response?.data || err.message
      );
      showToast({
        type: "error",
        message:
          err.response?.data?.message ||
          "Gagal memuat aktivitas. Coba cek kembali API key / token.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (act) => {
    setEditingId(act.id);
    setForm({
      title: act.title || "",
      description: act.description || "",
      city: act.city || act.location || "",
      price: act.price ?? "",
      imageUrl:
        act.imageUrl ||
        (Array.isArray(act.imageUrls) ? act.imageUrls[0] : "") ||
        "",
    });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Yakin ingin menghapus aktivitas ini?");
    if (!ok) return;

    try {
      await api.delete(`/delete-activity/${id}`);
      showToast({ type: "success", message: "Aktivitas berhasil dihapus." });
      await fetchActivities();
    } catch (err) {
      console.error(
        "Delete activity error:",
        err.response?.data || err.message
      );
      showToast({
        type: "error",
        message:
          err.response?.data?.message || "Gagal menghapus aktivitas ini.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // ⚠️ Sesuaikan dengan body yang ada di Postman kalau ada field tambahan
    const payload = {
      title: form.title?.trim(),
      description: form.description?.trim(),
      city: form.city?.trim(),
      location: form.city?.trim(), // beberapa API pakai "location"
      price: Number(form.price) || 0,
      imageUrl: form.imageUrl?.trim(),
      imageUrls: form.imageUrl ? [form.imageUrl.trim()] : [],
    };

    try {
      if (editingId) {
        await api.post(`/update-activity/${editingId}`, payload);
        showToast({
          type: "success",
          message: "Aktivitas berhasil diupdate ✅",
        });
      } else {
        await api.post("/create-activity", payload);
        showToast({
          type: "success",
          message: "Aktivitas baru berhasil dibuat ✅",
        });
      }

      await fetchActivities();
      resetForm();
    } catch (err) {
      console.error("Save activity error:", err.response?.data || err.message);

      const apiMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : "") ||
        "Gagal menyimpan aktivitas. Cek kembali field wajib di Postman.";

      showToast({
        type: "error",
        message: apiMsg,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Activity Management">
      <div className="grid md:grid-cols-[1.4fr,1fr] gap-6">
        {/* LIST ACTIVITIES */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Daftar Aktivitas
          </h2>

          {loading ? (
            <Spinner />
          ) : activities.length === 0 ? (
            <EmptyState
              title="Belum ada aktivitas."
              description="Buat aktivitas baru menggunakan form di sebelah kanan."
            />
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-3 border border-slate-200 rounded-xl p-3 bg-slate-50"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                      <img
                        src={getSafeImageUrl(
                          act.imageUrl ||
                            (Array.isArray(act.imageUrls)
                              ? act.imageUrls[0]
                              : ""),
                          "https://images.pexels.com/photos/672532/pexels-photo-672532.jpeg?auto=compress&cs=tinysrgb&w=600"
                        )}
                        alt={act.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {act.description}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {act.city || act.location || "-"} ·{" "}
                        {formatCurrency(act.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditClick(act)}
                      className="px-3 py-1 text-[11px] rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(act.id)}
                      className="px-3 py-1 text-[11px] rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FORM CREATE / UPDATE */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            {editingId ? "Edit Aktivitas" : "Buat Aktivitas Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Judul
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Kota / Lokasi
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Harga (IDR)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min={0}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Image URL
              </label>
              <input
                type="text"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <p className="text-[11px] text-slate-500">
                Gunakan URL gambar (http/https). Misal dari Unsplash atau Cloud
                Storage.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm hover:bg-slate-800 disabled:opacity-60"
              >
                {saving
                  ? editingId
                    ? "Menyimpan..."
                    : "Membuat..."
                  : editingId
                  ? "Simpan Perubahan"
                  : "Buat Aktivitas"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-50"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
}
