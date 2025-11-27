// src/pages/admin/AdminActivities.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatCurrency } from "../../lib/format.js";
import Spinner from "../../components/ui/Spinner.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import AdminLayout from "../../components/layout/AdminLayout.jsx";

// ==================== KONFIG ENDPOINT ====================
const CREATE_ACTIVITY_ENDPOINT = "/create-activity";
const UPDATE_ACTIVITY_ENDPOINT = "/update-activity"; // dipakai: `${UPDATE_ACTIVITY_ENDPOINT}/${id}`
const DELETE_ACTIVITY_ENDPOINT = "/delete-activity"; // dipakai: `${DELETE_ACTIVITY_ENDPOINT}/${id}`;

// NOTE: GANTI endpoint ini dengan yang mentor kasih di Postman
// misal: "/upload-image" atau "/upload-activity-image"
const UPLOAD_ACTIVITY_IMAGE_ENDPOINT = "/upload-image";

// ==================== HELPER ====================

function extractErrorMessage(err) {
  const res = err?.response;
  const data = res?.data;

  if (!data)
    return err.message || "Terjadi kesalahan tanpa response dari server.";

  if (typeof data === "string") return data;
  if (typeof data.message === "string") return data.message;
  if (typeof data.error === "string") return data.error;

  if (
    typeof data.code === "string" &&
    typeof data.status === "string" &&
    typeof data.message === "string"
  ) {
    return `${data.code} ${data.status} - ${data.message}`;
  }

  const firstString = Object.values(data).find((v) => typeof v === "string");
  if (firstString) return firstString;

  return "Gagal menyimpan aktivitas: " + JSON.stringify(data);
}

// Upload banyak gambar, balikan array URL
async function uploadActivityImages(files) {
  const uploaded = [];

  for (const file of files) {
    try {
      const formData = new FormData();
      // nama field "image" sesuai pesan error backend yg pakai req.files.image
      formData.append("image", file);

      // ⬇️ JANGAN set header di sini, biarkan interceptor + axios yg urus
      const res = await api.post(UPLOAD_ACTIVITY_IMAGE_ENDPOINT, formData);
      console.log("Upload image response:", res.data);

      const url =
        res.data?.data?.url ||
        res.data?.data?.imageUrl ||
        res.data?.url ||
        res.data?.imageUrl;

      if (url) {
        uploaded.push(url);
      } else {
        console.warn("Upload berhasil tapi URL tidak ditemukan di response.");
      }
    } catch (err) {
      console.error("Upload image gagal:", err.response?.data || err.message);
      // Untuk sekarang: kalau upload gagal, hentikan upload & kembalikan []
      return [];
    }
  }

  return uploaded;
}

// ==================== KOMPONEN UTAMA ====================

const initialForm = {
  title: "",
  description: "",
  location: "",
  price: "",
  imageUrl: "", // URL manual (opsional)
  categoryId: "", // string UUID dari dropdown
};

export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: file-file gambar yang mau di-upload
  const [imageFiles, setImageFiles] = useState([]);

  const { showToast } = useToast();

  // -------- Fetch list activity --------
  const loadActivities = async () => {
    try {
      setLoading(true);
      setTableError("");
      const res = await api.get("/activities");
      setActivities(res.data?.data || []);
    } catch (err) {
      console.error(
        "Admin activities list error:",
        err.response?.data || err.message
      );
      setTableError("Gagal memuat data aktivitas.");
    } finally {
      setLoading(false);
    }
  };

  // -------- Fetch categories untuk dropdown --------
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError("");
      const res = await api.get("/categories");
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error(
        "Admin activities categories error:",
        err.response?.data || err.message
      );
      setCategoriesError("Gagal memuat kategori.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
    loadCategories();
  }, []);

  // -------- Form helpers --------
  const resetForm = () => {
    setForm(initialForm);
    setEditing(null);
    setImageFiles([]); // NEW: reset file
  };

  const startCreate = () => {
    resetForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEdit = (activity) => {
    setEditing(activity);
    setForm({
      title: activity.title || "",
      description: activity.description || "",
      location: activity.location || "",
      price: activity.price ?? "",
      imageUrl:
        activity.imageUrl ||
        (Array.isArray(activity.imageUrls) && activity.imageUrls[0]) ||
        activity.thumbnail ||
        "",
      categoryId:
        activity.categoryId != null ? String(activity.categoryId) : "",
    });
    setImageFiles([]); // NEW: tidak otomatis preload file, kita hanya tampilkan URL
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
  };

  // -------- Submit create / update --------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast({ type: "error", message: "Judul aktivitas wajib diisi." });
      return;
    }

    const categoryValue = form.categoryId?.trim();
    if (!categoryValue) {
      showToast({
        type: "error",
        message: "Kategori wajib dipilih.",
      });
      return;
    }

    // Opsional: cek format UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(categoryValue)) {
      showToast({
        type: "error",
        message:
          "Category ID tidak valid. Pilih kategori dari dropdown atau refresh halaman.",
      });
      return;
    }

    const priceValue =
      form.price === "" || form.price == null
        ? null
        : Number(String(form.price).replace(/[^\d]/g, ""));

    const payload = {
      title: form.title.trim(),
      description: form.description,
      location: form.location,
      categoryId: categoryValue,
    };

    if (typeof priceValue === "number" && !Number.isNaN(priceValue)) {
      payload.price = priceValue;
    }

    // ====== HANDLE GAMBAR ======
    try {
      setIsSubmitting(true);
      let finalImageUrls = [];

      if (imageFiles.length > 0) {
        const uploaded = await uploadActivityImages(imageFiles);

        if (!uploaded.length) {
          // upload gagal → JANGAN blokir form
          showToast({
            type: "error",
            message:
              "Upload gambar ke API gagal (server error). Untuk sementara, kosongkan upload file dan gunakan kolom URL manual.",
          });
          // finalImageUrls tetap [], jadi activity tetap bisa disimpan tanpa imageUrls
        } else {
          finalImageUrls = uploaded;
        }
      } else if (form.imageUrl) {
        // fallback: hanya URL manual satu
        finalImageUrls = [form.imageUrl];
      }

      if (finalImageUrls.length > 0) {
        payload.imageUrl = finalImageUrls[0];
        payload.imageUrls = finalImageUrls;
      }

      const isEditing = Boolean(editing?.id);

      if (isEditing) {
        // sesuai Postman: update-activity pakai POST
        await api.post(`${UPDATE_ACTIVITY_ENDPOINT}/${editing.id}`, payload);
        showToast({
          type: "success",
          message: "Aktivitas berhasil diperbarui.",
        });
      } else {
        await api.post(CREATE_ACTIVITY_ENDPOINT, payload);
        showToast({
          type: "success",
          message: "Aktivitas baru berhasil dibuat.",
        });
      }

      resetForm();
      await loadActivities();
    } catch (err) {
      console.error("Save activity error raw:", err);
      const msg = extractErrorMessage(err);
      showToast({
        type: "error",
        message: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------- Delete --------
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus aktivitas ini? Tindakan ini tidak dapat dibatalkan."
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`${DELETE_ACTIVITY_ENDPOINT}/${id}`);
      showToast({
        type: "success",
        message: "Aktivitas berhasil dihapus.",
      });
      await loadActivities();
    } catch (err) {
      console.error(
        "Delete activity error:",
        err.response?.data || err.message
      );
      const msg = extractErrorMessage(err);
      showToast({
        type: "error",
        message: msg,
      });
    }
  };

  // ==================== RENDER ====================
  return (
    <AdminLayout
      title="Activities"
      description="Kelola aktivitas yang akan tampil di halaman user (ActivityList & ActivityDetail)."
    >
      {/* HEADER ATAS: JUDUL + TOMBOL TAMBAH */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-slate-900">
            Manajemen Aktivitas
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Data yang kamu buat di sini akan otomatis digunakan di halaman
            <span className="font-mono text-[11px] bg-slate-100 rounded px-2 py-[2px] mx-1">
              /activity
            </span>
            dan
            <span className="font-mono text-[11px] bg-slate-100 rounded px-2 py-[2px] mx-1">
              /activity/:id
            </span>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center px-4 py-2 rounded-full bg-slate-900 text-white text-xs md:text-sm hover:bg-slate-800"
        >
          + Tambah Aktivitas
        </button>
      </div>

      {/* GRID: FORM + TABEL */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr),minmax(0,1.8fr)]">
        {/* FORM */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-3">
            {editing ? "Edit Aktivitas" : "Buat Aktivitas Baru"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-3 text-xs md:text-sm"
          >
            {/* TITLE */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Judul Aktivitas*
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Contoh: Sea World Ancol"
              />
            </div>

            {/* LOCATION */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Lokasi
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Contoh: Jakarta, Indonesia"
              />
            </div>

            {/* CATEGORY DROPDOWN */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Category*
              </label>

              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryId: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
              >
                <option value="">-- Pilih kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {categoriesLoading && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Memuat kategori...
                </p>
              )}
              {categoriesError && (
                <p className="text-[10px] text-red-600 mt-1">
                  {categoriesError}
                </p>
              )}
              {!categoriesLoading &&
                !categoriesError &&
                categories.length === 0 && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Belum ada data kategori dari API.
                  </p>
                )}
            </div>

            {/* PRICE */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Harga (IDR)
              </label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="Contoh: 250000"
              />
            </div>

            {/* IMAGE URL MANUAL */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Gambar (URL) – opsional
              </label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
                placeholder="https://images.pexels.com/..."
              />
              {form.imageUrl && (
                <div className="mt-2">
                  <p className="text-[11px] text-slate-500 mb-1">
                    Preview URL:
                  </p>
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={form.imageUrl}
                      alt="Preview aktivitas"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1200";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* NEW: FILE UPLOAD MULTI */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Upload Gambar (boleh lebih dari satu)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="block w-full text-[11px] md:text-xs text-slate-600"
              />
              <p className="text-[10px] text-slate-500">
                Jika memilih file, gambar akan di-upload dan URL-nya otomatis
                disimpan sebagai <code>imageUrls</code>.
              </p>

              {imageFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-[11px] text-slate-500 mb-1">
                    Preview gambar yang akan di-upload:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {imageFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="h-20 rounded-lg overflow-hidden bg-slate-100"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Deskripsi
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none"
                placeholder="Ceritakan singkat tentang aktivitas ini..."
              />
            </div>

            {/* BUTTONS */}
            <div className="flex items-center justify-between gap-2 pt-2">
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] md:text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Batal edit
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto inline-flex items-center px-4 py-2 rounded-full bg-slate-900 text-white text-xs md:text-sm disabled:bg-slate-400"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : editing
                  ? "Simpan Perubahan"
                  : "Buat Aktivitas"}
              </button>
            </div>
          </form>
        </section>

        {/* TABEL LIST AKTIVITAS */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-3">
            Daftar Aktivitas
          </h2>

          {loading ? (
            <div className="py-6">
              <Spinner />
            </div>
          ) : tableError ? (
            <p className="text-xs md:text-sm text-red-600">{tableError}</p>
          ) : activities.length === 0 ? (
            <EmptyState
              title="Belum ada aktivitas."
              description="Buat aktivitas pertama kamu melalui form di sebelah kiri."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-[11px] md:text-xs text-left text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-2 font-semibold">Title</th>
                    <th className="py-2 px-2 font-semibold hidden md:table-cell">
                      Lokasi
                    </th>
                    <th className="py-2 px-2 font-semibold hidden md:table-cell">
                      Kategori
                    </th>
                    <th className="py-2 px-2 font-semibold">Harga</th>
                    <th className="py-2 pl-2 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((act) => (
                    <tr key={act.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2 align-top">
                        <div className="max-w-[200px] md:max-w-xs">
                          <p className="font-medium text-slate-900 line-clamp-2">
                            {act.title}
                          </p>
                        </div>
                      </td>
                      <td className="py-2 px-2 align-top hidden md:table-cell">
                        <span className="text-[11px] text-slate-500">
                          {act.location || "-"}
                        </span>
                      </td>
                      <td className="py-2 px-2 align-top hidden md:table-cell">
                        <span className="text-[11px] text-slate-500">
                          {act.category?.name || act.categoryId || "-"}
                        </span>
                      </td>
                      <td className="py-2 px-2 align-top whitespace-nowrap">
                        <span className="text-[11px] font-medium">
                          {formatCurrency(act.price || 0)}
                        </span>
                      </td>
                      <td className="py-2 pl-2 align-top text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(act)}
                            className="px-2 py-1 rounded-full border border-slate-300 text-[11px] hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(act.id)}
                            className="px-2 py-1 rounded-full border border-red-200 text-[11px] text-red-600 hover:bg-red-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
