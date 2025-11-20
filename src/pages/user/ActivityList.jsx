// src/pages/user/ActivityList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api.js"; // eslint-disable-line no-unused-vars />

function formatCurrency(value) {
  if (value == null) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | budget | premium

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [actRes, promoRes] = await Promise.all([
          api.get("/activities?limit=50"),
          api.get("/promos"),
        ]);

        setActivities(actRes.data?.data || []);
        setPromos(promoRes.data?.data || []);
      } catch (err) {
        console.error("Activities error:", err.response?.data || err.message);
        setError("Gagal memuat daftar aktivitas.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getActivityImage = (act) =>
    act?.imageUrl ||
    (Array.isArray(act?.imageUrls) && act.imageUrls[0]) ||
    act?.thumbnail ||
    "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200";

  const filteredActivities = activities.filter((act) => {
    const q = search.trim().toLowerCase();

    const matchesSearch =
      !q ||
      act.title?.toLowerCase().includes(q) ||
      act.location?.toLowerCase().includes(q) ||
      act.category?.name?.toLowerCase().includes(q);

    let matchesFilter = true;
    if (filter === "budget") {
      matchesFilter = (act.price || 0) <= 500000;
    } else if (filter === "premium") {
      matchesFilter = (act.price || 0) > 500000;
    }

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <div className="h-8 w-40 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-5 w-64 bg-slate-200 rounded-full animate-pulse" />
        <div className="flex gap-2 mt-4">
          <div className="h-9 w-16 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-9 w-20 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-9 w-24 bg-slate-200 rounded-full animate-pulse" />
        </div>
        <div className="space-y-3 mt-4">
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* HEADER */}
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
          Activities
        </p>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          Temukan aktivitas untuk perjalananmu
        </h1>
        <p className="text-sm md:text-base text-slate-600">
          Jelajahi berbagai aktivitas dan promo yang tersedia.
        </p>
        <p className="text-xs text-slate-500">
          Menampilkan{" "}
          <span className="font-semibold">{filteredActivities.length}</span>{" "}
          dari <span className="font-semibold">{activities.length}</span>{" "}
          aktivitas.
        </p>
      </header>

      {/* PROMO STRIP */}
      {promos.length > 0 && (
        <section className="bg-slate-900 text-white rounded-3xl p-4 md:p-5 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300">
            Promo
          </p>
          <div className="flex gap-3 overflow-x-auto scrollbar-none">
            {promos.slice(0, 4).map((promo) => (
              <div
                key={promo.id}
                className="min-w-[220px] bg-slate-800/70 rounded-2xl p-3 border border-slate-700"
              >
                <p className="text-xs font-semibold line-clamp-2">
                  {promo.title || promo.name}
                </p>
                {promo.promoCode && (
                  <p className="mt-2 inline-flex items-center rounded-full bg-slate-100 text-slate-900 text-[10px] px-2 py-0.5">
                    Code: {promo.promoCode}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-slate-300">
                  Min. transaksi:{" "}
                  {promo.minimumClaimPrice
                    ? formatCurrency(promo.minimumClaimPrice)
                    : "-"}
                  <br />
                  Potongan:{" "}
                  {promo.promoDiscountPrice
                    ? formatCurrency(promo.promoDiscountPrice)
                    : "-"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FILTER BAR */}
      <section className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full border text-xs md:text-sm ${
              filter === "all"
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilter("budget")}
            className={`px-3 py-1.5 rounded-full border text-xs md:text-sm ${
              filter === "budget"
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Budget (&le; 500K)
          </button>
          <button
            type="button"
            onClick={() => setFilter("premium")}
            className={`px-3 py-1.5 rounded-full border text-xs md:text-sm ${
              filter === "premium"
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Premium (&gt; 500K)
          </button>
        </div>

        <div className="w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Cari judul / lokasi / kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <p className="text-xs md:text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* LIST AKTIVITAS */}
      <section className="space-y-3">
        {filteredActivities.map((act) => (
          <Link
            key={act.id}
            to={`/activity/${act.id}`}
            className="flex gap-3 md:gap-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition shadow-xs p-3 md:p-4"
          >
            <div className="w-24 h-24 md:w-32 md:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              <img
                src={getActivityImage(act)}
                alt={act.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h2 className="text-sm md:text-base font-semibold text-slate-900">
                  {act.title}
                </h2>
                {act.location && (
                  <p className="text-[11px] md:text-xs text-slate-500">
                    {act.location}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {act.category?.name && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5">
                      {act.category.name}
                    </span>
                  )}
                  {act.price != null && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5">
                      {formatCurrency(act.price)}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] md:text-xs text-slate-500 line-clamp-2 mt-1">
                {act.description || "Aktivitas seru untuk perjalananmu."}
              </p>
            </div>
          </Link>
        ))}

        {filteredActivities.length === 0 && (
          <p className="text-sm text-slate-500">
            Tidak ada aktivitas yang cocok dengan pencarianmu.
          </p>
        )}
      </section>
    </div>
  );
}
