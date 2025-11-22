// src/pages/admin/AdminTransactions.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api";
import AdminLayout from "../../components/layout/AdminLayout.jsx";
import { formatCurrency, formatDateTime } from "../../lib/format.js";

// helper ambil total dari berbagai kemungkinan field
function getTotal(tx) {
  return (
    tx.totalAmount ?? // ini yang dipakai API Travel Journal
    tx.total_price ??
    tx.totalPrice ??
    tx.total ??
    tx.amount ??
    0
  );
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // ambil SEMUA transaksi
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

  // filter berdasar status
  const filtered = transactions.filter((tx) => {
    if (statusFilter === "all") return true;
    return (tx.status || "").toLowerCase() === statusFilter;
  });

  // hitung total revenue HANYA untuk status sukses / paid
  const totalRevenue = filtered.reduce((sum, tx) => {
    const status = (tx.status || "").toLowerCase();
    if (status === "success" || status === "paid") {
      return sum + getTotal(tx);
    }
    return sum;
  }, 0);

  const handleUpdateStatus = async (id, newStatus) => {
    const nice = newStatus === "success" ? "Success" : "Failed";
    const ok = window.confirm(`Ubah status transaksi ini menjadi "${nice}"?`);
    if (!ok) return;

    try {
      setUpdatingId(id);
      // API hanya menerima "success" atau "failed" (lowercase)
      await api.post(`/update-transaction-status/${id}`, {
        status: newStatus,
      });

      // update lokal supaya tidak perlu reload page
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === id ? { ...tx, status: newStatus.toUpperCase() } : tx
        )
      );
    } catch (err) {
      console.error(
        "update-transaction-status error:",
        err.response?.data || err.message
      );
      alert("Gagal update status transaksi.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout title="Semua Transaksi">
      {/* FILTER BAR + INFO */}
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
          {[
            { key: "all", label: "Semua" },
            { key: "pending", label: "Pending" },
            { key: "success", label: "Success" },
            { key: "failed", label: "Failed" },
            { key: "cancelled", label: "Cancelled" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-full border text-xs md:text-sm ${
                statusFilter === f.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f.label}
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
                <th className="text-left py-2 px-2 md:px-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const pm = tx.paymentMethod || tx.payment_method || null;
                const total = getTotal(tx);
                const statusLower = (tx.status || "").toLowerCase();

                const isPending = statusLower === "pending";

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
                      {formatCurrency(total)}
                    </td>

                    <td className="py-2 px-2 md:px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          statusLower === "success" || statusLower === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : statusLower === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : statusLower === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tx.status || "-"}
                      </span>
                    </td>

                    <td className="py-2 px-2 md:px-3">
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

                    <td className="py-2 px-2 md:px-3">
                      {isPending ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={updatingId === tx.id}
                            onClick={() => handleUpdateStatus(tx.id, "success")}
                            className="px-3 py-1 rounded-full text-[11px] bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
                          >
                            Approve (Success)
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === tx.id}
                            onClick={() => handleUpdateStatus(tx.id, "failed")}
                            className="px-3 py-1 rounded-full text-[11px] bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                          >
                            Reject (Failed)
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          Hanya transaksi pending yang bisa diubah.
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
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
