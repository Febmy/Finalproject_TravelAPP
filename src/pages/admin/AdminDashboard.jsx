import { useEffect, useState } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout.jsx";

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    users: 0,
    admins: 0,
    activities: 0,
    transactions: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [userRes, txRes, actRes] = await Promise.all([
          api.get("/all-user"),
          api.get("/all-transactions"),
          api.get("/activities?limit=100"),
        ]);

        const users = userRes.data.data || [];
        const transactions = txRes.data.data || [];
        const activities = actRes.data.data || [];

        const admins = users.filter((u) => u.role === "admin").length;

        const revenue = transactions
          .filter((tx) =>
            ["success", "SUCCESS", "paid", "PAID"].includes(tx.status)
          )
          .reduce(
            (sum, tx) => sum + (tx.totalPrice || tx.total || tx.amount || 0),
            0
          );

        setSummary({
          users: users.length,
          admins,
          activities: activities.length,
          transactions: transactions.length,
          revenue,
        });
      } catch (err) {
        console.error(
          "Admin dashboard error:",
          err.response?.data || err.message
        );
        setError("Gagal memuat ringkasan admin.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading && (
        <p className="text-sm text-slate-500">Memuat ringkasan dashboard...</p>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <p className="text-xs text-slate-500">Total User</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {summary.users}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {summary.admins} admin terdaftar
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <p className="text-xs text-slate-500">Aktivitas</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {summary.activities}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Diambil dari endpoint /activities
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <p className="text-xs text-slate-500">Transaksi</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {summary.transactions}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Data dari /all-transactions
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-900 text-slate-50">
            <p className="text-xs text-slate-300">Est. Revenue</p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(summary.revenue)}
            </p>
            <p className="mt-1 text-[11px] text-slate-300">
              Hanya transaksi status success/paid
            </p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
