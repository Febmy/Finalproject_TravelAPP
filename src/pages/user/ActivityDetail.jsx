// src/pages/user/ActivityDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatCurrency } from "../../lib/format.js";
const FALLBACK_ACTIVITY_IMAGE =
  "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200";

function getImage(act) {
  return (
    act?.imageUrl ||
    (Array.isArray(act?.imageUrls) && act.imageUrls[0]) ||
    act?.thumbnail ||
    FALLBACK_ACTIVITY_IMAGE
  );
}

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activity, setActivity] = useState(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/activity/${id}`);
        setActivity(res.data?.data || null);
      } catch (err) {
        console.error(
          "Activity detail error:",
          err.response?.data || err.message
        );
        setError(
          err.response?.status === 404
            ? "Aktivitas tidak ditemukan."
            : "Gagal memuat detail aktivitas."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast({
        type: "error",
        message: "Silakan login terlebih dahulu untuk memesan aktivitas.",
      });
      navigate("/login");
      return;
    }

    try {
      setAdding(true);
      await api.post("/add-cart", {
        activityId: id,
        bookingDate: date || null,
      });
      showToast({
        type: "success",
        message: "Berhasil menambahkan ke cart.",
      });
      navigate("/cart");
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err.message);
      showToast({
        type: "error",
        message: "Gagal menambahkan ke cart.",
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <div className="h-7 w-48 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-4 w-32 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-52 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="h-20 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <p className="text-sm md:text-base text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error || "Aktivitas tidak ditemukan."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/activity")}
          className="inline-flex px-4 py-2 rounded-full border border-slate-300 text-xs md:text-sm text-slate-700 hover:bg-slate-100"
        >
          Kembali ke daftar aktivitas
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-[11px] text-slate-500 hover:text-slate-700 mb-1"
      >
        ← Kembali
      </button>

      {/* Header */}
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
          Activity Detail
        </p>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          {activity.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {activity.location && (
            <span className="text-[11px] md:text-xs text-slate-500">
              {activity.location}
            </span>
          )}
          {activity.category?.name && (
            <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5">
              {activity.category.name}
            </span>
          )}
          {activity.price != null && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5">
              {formatCurrency(activity.price)}
            </span>
          )}
        </div>
      </header>

      {/* Image */}
      <div className="w-full h-52 md:h-72 rounded-3xl overflow-hidden bg-slate-100">
        <img
          src={getImage(activity)}
          alt={activity.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_ACTIVITY_IMAGE;
          }}
        />
      </div>

      {/* Content */}
      <section className="grid gap-5 md:grid-cols-[minmax(0,1.6fr),minmax(0,1.1fr)]">
        {/* Deskripsi */}
        <div className="space-y-3">
          <h2 className="text-sm md:text-base font-semibold text-slate-900">
            Deskripsi
          </h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {activity.description || "Belum ada deskripsi untuk aktivitas ini."}
          </p>
        </div>

        {/* Booking Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-4 md:p-5 space-y-3 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Booking
            </p>
            <p className="text-sm text-slate-100">
              Pilih tanggal perjalananmu, lalu lanjutkan ke keranjang untuk
              menyelesaikan pembayaran.
            </p>
          </div>

          <div className="space-y-2 mt-2">
            <label className="text-[11px] uppercase tracking-wide text-slate-300">
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-900/40 text-xs md:text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-200"
            />
            <p className="text-[10px] text-slate-400">
              Boleh dikosongkan jika tanggal masih tentative.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-700 mt-2">
            <p className="text-xs text-slate-200 mb-2">
              Estimasi harga mulai dari:
            </p>
            <p className="text-base md:text-lg font-semibold text-white">
              {formatCurrency(activity.price)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="mt-3 w-full inline-flex justify-center items-center rounded-full bg-white text-slate-900 text-xs md:text-sm px-4 py-2.5 font-medium hover:bg-slate-100 disabled:bg-slate-400 disabled:text-slate-100"
          >
            {adding ? "Menambahkan..." : "Tambah ke Cart"}
          </button>
        </div>
      </section>
    </div>
  );
}
