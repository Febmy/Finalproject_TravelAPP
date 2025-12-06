// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import { formatCurrency } from "../../lib/format.js";
import { useToast } from "../../context/ToastContext.jsx";
import { getFriendlyErrorMessage } from "../../lib/errors.js";

// helper: ambil total amount dari berbagai kemungkinan field
function getTotal(tx) {
  return (
    tx.totalAmount ??
    tx.total_price ??
    tx.totalPrice ??
    tx.total ??
    tx.amount ??
    0
  );
}

export default function AdminDashboard() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userCount, setUserCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [promoCount, setPromoCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    success: 0,
    failed: 0,
    cancelled: 0,
  });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersRes, txRes, actRes, promoRes] = await Promise.all([
        api.get("/all-user"),
        api.get("/all-transactions"),
        api.get("/activities"),
        api.get("/promos"),
      ]);

      const users = usersRes.data?.data || [];
      const transactions = txRes.data?.data || [];
      const activities = actRes.data?.data || [];
      const promos = promoRes.data?.data || [];

      setUserCount(users.length);
      setActivityCount(activities.length);
      setPromoCount(promos.length);
      setTransactionCount(transactions.length);

      // hitung total revenue & status distribusi
      let revenue = 0;
      let pending = 0;
      let success = 0;
      let failed = 0;
      let cancelled = 0;

      transactions.forEach((tx) => {
        const status = (tx.status || "").toLowerCase();
        const total = getTotal(tx);

        if (status === "success" || status === "paid") {
          revenue += total;
          success += 1;
        } else if (status === "pending") {
          pending += 1;
        } else if (status === "failed") {
          failed += 1;
        } else if (status === "cancelled") {
          cancelled += 1;
        }
      });

      setTotalRevenue(revenue);
      setPendingCount(pending);
      setStatusCounts({
        pending,
        success,
        failed,
        cancelled,
      });
    } catch (err) {
      console.error(
        "Admin dashboard error:",
        err.response?.data || err.message
      );
      const msg = getFriendlyErrorMessage(
        err,
        "Gagal memuat data dashboard admin."
      );
      setError(msg);
      showToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalForChart =
    statusCounts.pending +
    statusCounts.success +
    statusCounts.failed +
    statusCounts.cancelled;

  // bikin bar sedikit lebih tinggi (min 12%)
  const makeHeight = (count) => {
    if (totalForChart === 0) return "12%";
    const pct = (count / totalForChart) * 100;
    return `${Math.max(12, pct)}%`;
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* HEADER + ERROR STATE */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Ringkasan singkat aktivitas sistem: user, aktivitas, transaksi,
              dan revenue.
            </p>
          </div>

          {!loading && (
            <button
              type="button"
              onClick={loadDashboard}
              className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 text-xs md:text-sm text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs md:text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SKELETON LOADING */}
        {loading && !error && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
            </div>
            <div className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
          </div>
        )}

        {/* MAIN CONTENT */}
        {!loading && !error && (
          <>
            {/* STAT CARDS */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* TOTAL USERS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Total Users
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {userCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Total akun terdaftar (admin &amp; user).
                </p>
              </div>

              {/* ACTIVITIES */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Activities
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {activityCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Aktivitas yang aktif dan siap dipesan.
                </p>
              </div>

              {/* TRANSACTIONS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Transactions
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {transactionCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {pendingCount} transaksi masih berstatus pending.
                </p>
              </div>

              {/* REVENUE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Revenue
                </p>
                <p className="mt-2 text-xl font-semibold text-emerald-700">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Akumulasi dari transaksi berstatus sukses / paid.
                </p>
              </div>
            </section>

            {/* PROMO SUMMARY + STATUS CHART */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ACTIVE PROMOS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm md:col-span-1">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  Active Promos
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {promoCount}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Promo aktif yang dapat digunakan user.
                </p>
              </div>

              {/* MINI STATUS CHART */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Transaction Status Overview
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Total:{" "}
                    <span className="font-medium">{transactionCount}</span>{" "}
                    transaksi
                  </p>
                </div>

                {transactionCount === 0 ? (
                  <p className="text-xs text-slate-500">
                    Belum ada transaksi yang tercatat.
                  </p>
                ) : (
                  <>
                    {/* Bar Chart Sederhana */}
                    <div className="flex items-end gap-3 h-36 md:h-40 mt-2">
                      {/* Pending */}
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full max-w-[40px] rounded-t-lg bg-amber-300 border border-amber-400"
                          style={{ height: makeHeight(statusCounts.pending) }}
                        />
                        <p className="text-[11px] text-slate-500">Pending</p>
                        <p className="text-[11px] font-medium text-slate-900">
                          {statusCounts.pending} trx
                        </p>
                      </div>

                      {/* Success */}
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full max-w-[40px] rounded-t-lg bg-emerald-300 border border-emerald-400"
                          style={{ height: makeHeight(statusCounts.success) }}
                        />
                        <p className="text-[11px] text-slate-500">Success</p>
                        <p className="text-[11px] font-medium text-slate-900">
                          {statusCounts.success} trx
                        </p>
                      </div>

                      {/* Failed */}
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full max-w-[40px] rounded-t-lg bg-red-300 border border-red-400"
                          style={{ height: makeHeight(statusCounts.failed) }}
                        />
                        <p className="text-[11px] text-slate-500">Failed</p>
                        <p className="text-[11px] font-medium text-slate-900">
                          {statusCounts.failed} trx
                        </p>
                      </div>

                      {/* Cancelled */}
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full max-w-[40px] rounded-t-lg bg-slate-300 border border-slate-400"
                          style={{ height: makeHeight(statusCounts.cancelled) }}
                        />
                        <p className="text-[11px] text-slate-500">Cancelled</p>
                        <p className="text-[11px] font-medium text-slate-900">
                          {statusCounts.cancelled} trx
                        </p>
                      </div>
                    </div>

                    {/* Legend / Penjelasan */}
                    <p className="mt-3 text-[11px] text-slate-500">
                      Tinggi bar merepresentasikan proporsi jumlah transaksi
                      untuk masing-masing status pada periode ini.
                    </p>
                  </>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
