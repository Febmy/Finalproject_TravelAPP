// src/pages/user/Promos.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { formatCurrency } from "../../lib/format.js";

export default function Promos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/promos"); // GET /api/v1/promos
        setPromos(res.data?.data || []);
      } catch (err) {
        console.error("Promos page error:", err.response?.data || err.message);
        setError("Gagal memuat data promo.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <div className="h-7 w-40 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-4 w-64 bg-slate-200 rounded-full animate-pulse" />
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* HEADER */}
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
          Promos
        </p>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          Promo spesial untuk perjalananmu
        </h1>
        <p className="text-sm md:text-base text-slate-600">
          Semua data promo di sini diambil langsung dari API{" "}
          <span className="font-mono text-[11px] bg-slate-100 px-2 py-[2px] rounded">
            /promos
          </span>{" "}
          yang sama dengan admin.
        </p>
      </header>

      {error && (
        <p className="text-xs md:text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* GRID PROMOS */}
      {promos.length === 0 && !error ? (
        <p className="text-sm text-slate-500">
          Belum ada promo yang aktif saat ini.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {promos.map((promo) => {
            const title = promo.title || promo.name || "Untitled Promo";
            const code = promo.promoCode || promo.promo_code;
            const minPrice =
              promo.minimumClaimPrice ?? promo.minimum_claim_price;
            const discount =
              promo.promoDiscountPrice ?? promo.promo_discount_price;

            return (
              <div
                key={promo.id}
                className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
              >
                <div className="space-y-1 mb-3">
                  <h2 className="text-sm md:text-base font-semibold text-slate-900 line-clamp-2">
                    {title}
                  </h2>
                  {promo.description && (
                    <p className="text-xs text-slate-500 line-clamp-3">
                      {promo.description}
                    </p>
                  )}
                </div>

                {/* INFO PROMO */}
                <div className="mt-auto space-y-2 text-xs">
                  {code && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500">
                        Kode Promo
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-900 text-white text-[11px] px-2 py-0.5">
                        {code}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      Min. transaksi
                    </span>
                    <span className="text-[11px] font-medium text-slate-800">
                      {minPrice ? formatCurrency(minPrice) : "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">Potongan</span>
                    <span className="text-[11px] font-medium text-emerald-700">
                      {discount ? formatCurrency(discount) : "-"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
