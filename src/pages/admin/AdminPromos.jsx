// src/pages/admin/AdminPromos.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import AdminLayout from "../../components/AdminLayout.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { useToast } from "../../context/ToastContext.jsx";

// Helper: ambil pesan error paling berguna dari response API
const extractErrorMessage = (err) => {
  const res = err?.response;
  const data = res?.data;

  // 🔍 Paksa tampilkan detail JSON di console:
  try {
    console.log(
      "create-promo error detail JSON:",
      JSON.stringify(data, null, 2)
    );
  } catch {
    console.log("create-promo error detail (raw):", data);
  }

  if (!data)
    return err.message || "Terjadi kesalahan tanpa response dari server.";

  if (typeof data === "string") return data;
  if (typeof data.message === "string") return data.message;
  if (typeof data.error === "string") return data.error;

  // Kalau server pakai bentuk { code, status, message }
  if (
    typeof data.code === "string" &&
    typeof data.status === "string" &&
    typeof data.message === "string"
  ) {
    return `${data.code} ${data.status} - ${data.message}`;
  }

  // Coba ambil string pertama dari object (mis: dari field errors)
  const firstString = Object.values(data).find((v) => typeof v === "string");
  if (firstString) return firstString;

  // fallback terakhir: stringified
  return "Gagal menyimpan promo: " + JSON.stringify(data);
};

const formatCurrency = (value) => {
  if (!value && value !== 0) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return `Rp${num.toLocaleString("id-ID")}`;
};

export default function AdminPromos() {
  const { showToast } = useToast();

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    promo_code: "",
    minimum_claim_price: "",
    promo_discount_price: "",
    imageUrl: "",
    terms_condition: "",
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ──────────────────────────────────────────────
  // FETCH DATA PROMO
  // ──────────────────────────────────────────────
  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/promos");
      const data = res.data?.data || [];
      setPromos(data);
    } catch (err) {
      console.error("Fetch promos error:", err.response?.data || err.message);
      showToast({
        type: "error",
        message:
          err.response?.data?.message ||
          "Gagal memuat data promo. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  // ──────────────────────────────────────────────
  // FORM HANDLERS
  // ──────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hanya untuk preview di UI, BUKAN dikirim ke API
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    // API hanya terima imageUrl (string URL), jadi user tetap harus isi field imageUrl
  };

  const handleEdit = (promo) => {
    setForm({
      id: promo.id,
      name: promo.name || "",
      description: promo.description || "",
      promo_code: promo.promo_code || "",
      minimum_claim_price:
        promo.minimum_claim_price != null
          ? String(promo.minimum_claim_price)
          : "",
      promo_discount_price:
        promo.promo_discount_price != null
          ? String(promo.promo_discount_price)
          : "",
      imageUrl: promo.imageUrl || "",
      terms_condition: promo.terms_condition || "",
    });
    setPreviewUrl(promo.imageUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      description: "",
      promo_code: "",
      minimum_claim_price: "",
      promo_discount_price: "",
      imageUrl: "",
      terms_condition: "",
    });
    setPreviewUrl("");
  };

  // ──────────────────────────────────────────────
  // SUBMIT (CREATE / UPDATE PROMO)
  // ──────────────────────────────────────────────
  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validasi dasar
      if (!form.name || !form.promo_code) {
        showToast({
          type: "error",
          message: "Nama promo dan kode promo wajib diisi.",
        });
        setIsSubmitting(false);
        return;
      }

      // Konversi numeric
      const min =
        form.minimum_claim_price !== ""
          ? Number(form.minimum_claim_price)
          : undefined;
      const disc =
        form.promo_discount_price !== ""
          ? Number(form.promo_discount_price)
          : undefined;

      // (opsional) validasi: diskon tidak boleh lebih besar dari minimum
      if (
        typeof min === "number" &&
        typeof disc === "number" &&
        !Number.isNaN(min) &&
        !Number.isNaN(disc) &&
        disc > min
      ) {
        showToast({
          type: "error",
          message:
            "Discount price tidak boleh lebih besar dari minimum claim price.",
        });
        setIsSubmitting(false);
        return;
      }

      // ⚠️ SESUAIKAN dengan body di Postman kalau ada field lain
      const payload = {
        // API minta "title" → ambil dari input "name"
        title: form.name,
        // boleh kirim "name" juga, tapi yang penting "title" ada
        name: form.name,
        description: form.description,
        promo_code: form.promo_code,
        terms_condition: form.terms_condition,
      };

      if (typeof min === "number" && !Number.isNaN(min)) {
        payload.minimum_claim_price = min;
      }

      if (typeof disc === "number" && !Number.isNaN(disc)) {
        payload.promo_discount_price = disc;
      }

      // imageUrl HARUS string http/https, bukan blob / data:image
      if (form.imageUrl) {
        payload.imageUrl = form.imageUrl;
      }

      console.log("Create/Update promo payload:", payload);

      if (form.id) {
        // UPDATE
        await api.post(`/update-promo/${form.id}`, payload);
        showToast({ type: "success", message: "Promo berhasil diperbarui." });
      } else {
        // CREATE
        await api.post("/create-promo", payload);
        showToast({ type: "success", message: "Promo baru berhasil dibuat." });
      }

      resetForm();
      fetchPromos();
    } catch (err) {
      console.error("Save promo error raw:", err);
      const msg = extractErrorMessage(err);
      showToast({
        type: "error",
        message: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus promo ini?")) return;

    try {
      await api.delete(`/delete-promo/${id}`);
      showToast({ type: "success", message: "Promo berhasil dihapus." });
      fetchPromos();
    } catch (err) {
      console.error("Delete promo error:", err);
      const msg = extractErrorMessage(err);
      showToast({
        type: "error",
        message: msg,
      });
    }
  };

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────
  return (
    <AdminLayout title="Promo Management">
      <div className="space-y-6">
        {/* FORM */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4 text-sm md:text-base">
            {form.id ? "Edit Promo" : "Tambah Promo"}
          </h2>

          <form
            onSubmit={handlePromoSubmit}
            className="grid md:grid-cols-2 gap-4 md:gap-6 text-sm"
          >
            {/* Kolom kiri */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Nama Promo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="Contoh: Diskon Akhir Tahun"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Kode Promo *
                </label>
                <input
                  type="text"
                  name="promo_code"
                  value={form.promo_code}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="Contoh: AKHIRTAHUN50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Min. Claim Price
                  </label>
                  <input
                    type="number"
                    name="minimum_claim_price"
                    value={form.minimum_claim_price}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="cth: 500000"
                    min={0}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Discount Price
                  </label>
                  <input
                    type="number"
                    name="promo_discount_price"
                    value={form.promo_discount_price}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    placeholder="cth: 100000"
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Image URL (opsional)
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="https://..."
                />
                <p className="text-[11px] text-slate-400">
                  Gunakan URL gambar publik (mis. dari Cloudinary / Unsplash).
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Upload Gambar (preview saja)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs"
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mt-2 w-40 h-24 object-cover rounded-lg border border-slate-200"
                  />
                )}
              </div>
            </div>

            {/* Kolom kanan */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="Deskripsi singkat promo..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Terms & Conditions
                </label>
                <textarea
                  name="terms_condition"
                  value={form.terms_condition}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="Syarat & ketentuan promo..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-900 text-white text-xs md:text-sm hover:bg-slate-800 disabled:opacity-60"
                >
                  {isSubmitting
                    ? form.id
                      ? "Menyimpan..."
                      : "Membuat..."
                    : form.id
                    ? "Simpan Perubahan"
                    : "Buat Promo"}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs px-3 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>

        {/* LIST PROMO */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900 text-sm md:text-base">
              Daftar Promo
            </h2>
          </div>

          {loading ? (
            <Spinner />
          ) : promos.length === 0 ? (
            <EmptyState
              title="Belum ada promo."
              description="Tambahkan promo baru menggunakan form di atas."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="py-2 pr-3">Nama</th>
                    <th className="py-2 px-3">Kode</th>
                    <th className="py-2 px-3">Min. Claim</th>
                    <th className="py-2 px-3">Diskon</th>
                    <th className="py-2 px-3">Gambar</th>
                    <th className="py-2 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => (
                    <tr
                      key={promo.id}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="py-2 pr-3 align-top">
                        <div className="font-medium text-slate-900">
                          {promo.name}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {promo.description}
                        </div>
                      </td>
                      <td className="py-2 px-3 align-top">
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-full">
                          {promo.promo_code}
                        </span>
                      </td>
                      <td className="py-2 px-3 align-top">
                        {formatCurrency(promo.minimum_claim_price)}
                      </td>
                      <td className="py-2 px-3 align-top">
                        {formatCurrency(promo.promo_discount_price)}
                      </td>
                      <td className="py-2 px-3 align-top">
                        {promo.imageUrl ? (
                          <img
                            src={promo.imageUrl}
                            alt={promo.name}
                            className="w-16 h-10 object-cover rounded border border-slate-200"
                          />
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right align-top">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(promo)}
                            className="text-[11px] px-2 py-1 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(promo.id)}
                            className="text-[11px] px-2 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50"
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
