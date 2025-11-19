// src/pages/admin/AdminTransactions.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/AdminLayout.jsx";

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/all-transactions");
        setTransactions(res.data.data || []);
      } catch (err) {
        console.error(
          "Admin transactions error:",
          err.response?.data || err.message
        );
        setError("Gagal memuat semua transaksi.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = transactions.filter((tx) => {
    if (statusFilter === "all") return true;
    return (tx.status || "").toLowerCase() === statusFilter;
  });

  const totalRevenue = filtered
    .filter((tx) =>
      ["success", "paid"].includes((tx.status || "").toLowerCase())
    )
    .reduce(
      (sum, tx) => sum + (tx.totalPrice || tx.total || tx.amount || 0),
      0
    );

  return (
    <AdminLayout title="Semua Transaksi">
      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {filtered.length} transaksi
          </p>
          <p className="text-xs text-slate-500">
            Total revenue (filter saat ini): {formatCurrency(totalRevenue)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          {["all", "pending", "success", "cancel"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full border text-xs md:text-sm ${
                statusFilter === st
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st === "all" ? "Semua" : st[0].toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR / LOADING */}
      {loading && <p className="text-sm text-slate-500">Memuat transaksi...</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {/* TABEL */}
      {!loading && !error && (
        <div className="overflow-x-auto -mx-2 md:mx-0">
          <table className="min-w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-2 px-2 md:px-3">ID</th>
                <th className="text-left py-2 px-2 md:px-3">User</th>
                <th className="text-left py-2 px-2 md:px-3">Total</th>
                <th className="text-left py-2 px-2 md:px-3">Status</th>
                <th className="text-left py-2 px-2 md:px-3">Metode</th>
                <th className="text-left py-2 px-2 md:px-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const pm = tx.paymentMethod || tx.payment_method || null;

                return (
                  <tr
                    key={tx.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-2 px-2 md:px-3 font-mono text-[11px]">
                      {tx.id}
                    </td>
                    <td className="py-2 px-2 md:px-3">
                      <p className="font-medium text-slate-900 text-xs md:text-sm">
                        {tx.user?.name || "-"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {tx.user?.email || "-"}
                      </p>
                    </td>
                    <td className="py-2 px-2 md:px-3">
                      {formatCurrency(
                        tx.totalPrice || tx.total || tx.amount || 0
                      )}
                    </td>
                    <td className="py-2 px-2 md:px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          (tx.status || "").toLowerCase() === "success" ||
                          (tx.status || "").toLowerCase() === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : (tx.status || "").toLowerCase() === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tx.status || "-"}
                      </span>
                    </td>
                    <td className="py-2 px-2 md:px-3">
                      {/* 🔹 TAMPILKAN NAMA PAYMENT METHOD, BUKAN OBJECT */}
                      <p className="text-xs text-slate-900">
                        {pm?.name ||
                          pm?.virtual_account_name ||
                          "Unknown method"}
                      </p>
                      {pm?.virtual_account_number && (
                        <p className="text-[11px] text-slate-500">
                          VA: {pm.virtual_account_number}
                        </p>
                      )}
                    </td>
                    <td className="py-2 px-2 md:px-3 text-xs text-slate-600">
                      {formatDateTime(tx.createdAt || tx.updatedAt)}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 px-3 text-center text-sm text-slate-500"
                  >
                    Tidak ada transaksi untuk filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
