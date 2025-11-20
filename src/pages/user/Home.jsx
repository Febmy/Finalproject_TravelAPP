// src/pages/user/Homepage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api.js";

export default function Homepage() {
  const [promos, setPromos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Ambil data promos & activities dari API
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [pRes, aRes] = await Promise.all([
          api.get("/promos"),
          api.get("/activities?limit=8"),
        ]);

        setPromos(pRes.data?.data || []);
        setActivities(aRes.data?.data || []);
      } catch (err) {
        console.error("Homepage error:", err.response?.data || err.message);
        setError("Gagal memuat data homepage.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // SKELETON LOADING
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="h-40 md:h-56 rounded-3xl bg-slate-200 animate-pulse" />
        <div className="space-y-3">
          <div className="h-10 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-10 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-10 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // ====== DATA PROMO UTAMA ======
  const heroPromo = promos[0];

  const formatCurrency = (value) => {
    if (value == null) return "-";
    const num = Number(value);
    if (Number.isNaN(num)) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const heroPromoCode = heroPromo?.promo_code;
  const heroMinPrice = heroPromo?.minimum_claim_price;
  const heroDiscount = heroPromo?.promo_discount_price;

  const heroImage =
    heroPromo?.imageUrl ||
    (Array.isArray(heroPromo?.imageUrls) && heroPromo.imageUrls[0]) ||
    "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200";

  // Ambil beberapa aktivitas untuk ditampilkan
  const topActivities = activities.slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* ===== HERO PROMO DARI API ===== */}
      <section className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-lg transition grid md:grid-cols-[2fr,1.2fr] gap-6">
        {/* KIRI: teks promo */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Promo
          </p>
          <h1 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900">
            {heroPromo?.title ||
              heroPromo?.name ||
              "Staycation Brings Silaturahmi 🙏"}
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-600 max-w-xl">
            {heroPromo?.description ||
              "Friendly reminder, family staycation shall be affordable. Nikmati diskon menarik untuk berbagai destinasi liburan."}
          </p>

          {/* KODE PROMO */}
          {heroPromoCode && (
            <p className="mt-3 inline-flex items-center gap-2 text-xs md:text-sm text-slate-700">
              Kode Promo:
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-[11px] tracking-wide">
                {heroPromoCode}
              </span>
            </p>
          )}

          {/* INFO MIN & DISKON */}
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] md:text-xs text-slate-700">
            {heroMinPrice != null && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100">
                Min. transaksi {formatCurrency(heroMinPrice)}
              </span>
            )}
            {heroDiscount != null && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                Diskon {formatCurrency(heroDiscount)}
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/activity")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs md:text-sm hover:bg-slate-800"
            >
              Lihat aktivitas
              <span aria-hidden="true">↗</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/promos")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-xs md:text-sm hover:bg-slate-50"
            >
              Lihat semua promo
            </button>
          </div>
        </div>

        {/* KANAN: gambar */}
        <div className="rounded-3xl overflow-hidden bg-slate-100">
          <img
            src={heroImage}
            alt={heroPromo?.title || heroPromo?.name || "Promo TravelApp"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </section>

      {/* ===== SECTION I–III (CTA) ===== */}
      <section className="space-y-3">
        <button
          onClick={() => navigate("/activity")}
          className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-left text-sm md:text-base flex items-center justify-between hover:shadow-sm hover:-translate-y-0.5 transition duration-200"
        >
          <span>Section I – Semua Aktivitas</span>
          <span className="text-xs text-slate-500">Lihat &rsaquo;</span>
        </button>
        <button
          onClick={() => navigate("/activity")}
          className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-left text-sm md:text-base flex items-center justify-between hover:shadow-sm hover:-translate-y-0.5 transition duration-200"
        >
          <span>Section II – Rekomendasi</span>
          <span className="text-xs text-slate-500">Lihat &rsaquo;</span>
        </button>
        <button
          onClick={() => navigate("/promos")}
          className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-left text-sm md:text-base flex items-center justify-between hover:shadow-sm hover:-translate-y-0.5 transition duration-200"
        >
          <span>Section III – Promo Terbaru</span>
          <span className="text-xs text-slate-500">Lihat &rsaquo;</span>
        </button>
      </section>

      {/* ===== LIST AKTIVITAS ===== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold text-slate-900">
            Aktivitas Populer
          </h2>
          <button
            type="button"
            onClick={() => navigate("/activity")}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Lihat semua
          </button>
        </div>

        {topActivities.length === 0 ? (
          <p className="text-xs text-slate-500">
            Belum ada aktivitas yang tersedia.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topActivities.map((act) => (
              <Link
                key={act.id}
                to={`/activity/${act.id}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition"
              >
                <div className="h-24 md:h-28 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={
                      act.imageUrls?.[0] ||
                      act.thumbnail ||
                      "https://images.pexels.com/photos/672532/pexels-photo-672532.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    }
                    alt={act.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="px-4 py-3 flex-1 flex flex-col justify-between">
                  <p className="font-semibold text-sm md:text-base mb-1 line-clamp-2">
                    {act.title}
                  </p>
                  <p className="text-xs md:text-sm text-slate-500">
                    Rp{(act.price || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
