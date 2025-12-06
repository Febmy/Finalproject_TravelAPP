// src/pages/user/ActivityList.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import ActivityCard from "../../components/activity/ActivityCard.jsx";
import { formatCurrency } from "../../lib/format.js";
import { getFriendlyErrorMessage } from "../../lib/errors.js";

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
          api.get("/activities"),
          api.get("/promos"),
        ]);

        setActivities(actRes.data?.data || []);
        setPromos(promoRes.data?.data || []);
      } catch (err) {
        console.error("Activities error:", err.response?.data || err.message);
        const msg = getFriendlyErrorMessage(
          err,
          "Gagal memuat daftar aktivitas dan promo."
        );
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredActivities = activities.filter((act) => {
    const q = search.trim().toLowerCase();

    const matchesSearch =
      !q ||
      act.title?.toLowerCase().includes(q) ||
      act.location?.toLowerCase().includes(q);

    const price = act.price || 0;
    let matchesFilter = true;

    if (filter === "budget") {
      matchesFilter = price <= 500_000;
    } else if (filter === "premium") {
      matchesFilter = price > 500_000;
    }

    return matchesSearch && matchesFilter;
  });

  if (error) {
    return (
      <section className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            All Activities
          </h1>
          <p className="text-sm text-slate-600">
            Terjadi kesalahan saat memuat daftar aktivitas.
          </p>
        </header>

        <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2">
          <p className="text-xs md:text-sm text-red-700">{error}</p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex px-4 py-2 rounded-full border border-slate-200 text-xs md:text-sm text-slate-700 hover:bg-slate-50"
        >
          Coba lagi
        </button>
      </section>
    );
  }
  
  // === LOADING ===
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-4">
        <div className="h-5 w-24 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-7 w-64 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-4 w-80 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-4 w-48 bg-slate-200 rounded-full animate-pulse" />
        <div className="space-y-3 mt-4">
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // === ERROR ===
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-3">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
            Activities
          </p>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Temukan aktivitas untuk perjalananmu
          </h1>
        </header>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // === NORMAL UI ===
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
            {promos.slice(0, 4).map((promo) => {
              const code = promo.promo_code || promo.promoCode;
              const min = promo.minimum_claim_price ?? promo.minimumClaimPrice;
              const discount =
                promo.promo_discount_price ?? promo.promoDiscountPrice;

              return (
                <div
                  key={promo.id}
                  className="min-w-[220px] bg-slate-800/70 rounded-2xl p-3 border border-slate-700"
                >
                  <p className="text-xs font-semibold line-clamp-2">
                    {promo.title || promo.name}
                  </p>

                  {code && (
                    <p className="mt-2 inline-flex items-center rounded-full bg-slate-100 text-slate-900 text-[10px] px-2 py-0.5">
                      Code: {code}
                    </p>
                  )}

                  <p className="mt-1 text-[11px] text-slate-300">
                    Min. transaksi: {min ? formatCurrency(min) : "-"}
                    <br />
                    Potongan: {discount ? formatCurrency(discount) : "-"}
                  </p>
                </div>
              );
            })}
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

        <div className="w-full md:w-64 flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1.5">
          <span className="text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aktivitas atau lokasi..."
            className="flex-1 bg-transparent text-xs md:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </section>

      {/* LIST AKTIVITAS */}
      <section className="space-y-3">
        {filteredActivities.map((act) => (
          <ActivityCard key={act.id} activity={act} />
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
