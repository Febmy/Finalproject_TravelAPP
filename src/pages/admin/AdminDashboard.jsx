// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import AdminLayout from "../../components/layout/AdminLayout.jsx";

function StatCard({ title, value, note, bgClass, detailTo }) {
  return (
    <div
      className={`rounded-3xl p-5 text-white flex flex-col justify-between shadow-sm ${bgClass}`}
    >
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-80">
          {title}
        </p>
        <p className="text-3xl font-semibold">{value}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11px] opacity-90">{note}</p>
        {detailTo && (
          <Link
            to={detailTo}
            className="text-[11px] underline underline-offset-4"
          >
            Lihat detail
          </Link>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [hasPartialError, setHasPartialError] = useState(false);
  const [stats, setStats] = useState({
    activities: 0,
    promos: 0,
    transactions: 0,
    users: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setHasPartialError(false);

      try {
        const [activitiesRes, promosRes, txRes, userRes] =
          await Promise.allSettled([
            api.get("/activities"),
            api.get("/promos"),
            api.get("/my-transactions"), // transaksi akun login
            api.get("/user"), // profile akun login
          ]);

        let activitiesCount = 0;
        let promosCount = 0;
        let transactionsCount = 0;
        let usersCount = 0;
        let anyError = false;

        // ACTIVITIES (GLOBAL)
        if (activitiesRes.status === "fulfilled") {
          const data = activitiesRes.value.data?.data || [];
          activitiesCount = Array.isArray(data) ? data.length : 0;
        } else {
          anyError = true;
          console.error(
            "Dashboard activities error:",
            activitiesRes.reason?.response?.data || activitiesRes.reason
          );
        }

        // PROMOS (GLOBAL)
        if (promosRes.status === "fulfilled") {
          const data = promosRes.value.data?.data || [];
          promosCount = Array.isArray(data) ? data.length : 0;
        } else {
          anyError = true;
          console.error(
            "Dashboard promos error:",
            promosRes.reason?.response?.data || promosRes.reason
          );
        }

        // MY TRANSACTIONS (PER AKUN)
        if (txRes.status === "fulfilled") {
          const data = txRes.value.data?.data || [];
          transactionsCount = Array.isArray(data) ? data.length : 0;
        } else {
          anyError = true;
          console.error(
            "Dashboard my-transactions error:",
            txRes.reason?.response?.data || txRes.reason
          );
        }

        // ACTIVE USER (PER AKUN)
        if (userRes.status === "fulfilled") {
          const user = userRes.value.data?.data || null;
          usersCount = user ? 1 : 0;
        } else {
          anyError = true;
          console.error(
            "Dashboard user profile error:",
            userRes.reason?.response?.data || userRes.reason
          );
        }

        setStats({
          activities: activitiesCount,
          promos: promosCount,
          transactions: transactionsCount,
          users: usersCount,
        });

        if (anyError) {
          setHasPartialError(true);
          showToast({
            type: "warning",
            message:
              "Sebagian data dashboard gagal dimuat. Cek console untuk detail.",
          });
        }
      } catch (err) {
        console.error(
          "Dashboard fatal error:",
          err?.response?.data || err?.message || err
        );
        setHasPartialError(true);
        showToast({
          type: "error",
          message: "Gagal memuat data dashboard.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [showToast]);

  // STATE LOADING → sekarang tetap dibungkus AdminLayout
  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <PageContainer>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="h-4 w-32 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-6 w-40 bg-slate-200 rounded-full animate-pulse" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((k) => (
              <div
                key={k}
                className="rounded-3xl bg-slate-200/80 h-32 animate-pulse"
              />
            ))}
          </div>
        </PageContainer>
      </AdminLayout>
    );
  }

  // STATE NORMAL
  return (
    <AdminLayout title="Dashboard">
      <PageContainer>
        {/* HEADER */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm mb-6">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Admin Panel
              </p>
              <h1 className="text-lg md:text-xl font-semibold text-slate-900">
                Dashboard
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Ringkasan data</p>
            </div>
          </div>

          <div className="border-t border-slate-200 px-3 md:px-6 py-2 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-slate-900 text-white">
              Dashboard
            </span>
            <Link
              to="/admin/transactions"
              className="px-3 py-1.5 rounded-full text-slate-700 hover:bg-slate-100"
            >
              Transaksi
            </Link>
            <Link
              to="/admin/users"
              className="px-3 py-1.5 rounded-full text-slate-700 hover:bg-slate-100"
            >
              Users
            </Link>
            <Link
              to="/admin/activities"
              className="px-3 py-1.5 rounded-full text-slate-700 hover:bg-slate-100"
            >
              Activities
            </Link>
            <Link
              to="/admin/promos"
              className="px-3 py-1.5 rounded-full text-slate-700 hover:bg-slate-100"
            >
              Promos &amp; Banner
            </Link>

            <span className="ml-auto hidden md:inline text-[11px] text-slate-400">
              ← Kembali ke User App lewat navbar biasa
            </span>
          </div>
        </div>

        {hasPartialError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            Beberapa data ringkasan gagal dimuat dari API. Silakan cek console
            browser untuk detail error.
          </div>
        )}

        {/* STAT CARDS */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Activities"
              value={stats.activities}
              note="Global: jumlah data dari endpoint /activities"
              bgClass="bg-indigo-600"
              detailTo="/admin/activities"
            />
            <StatCard
              title="Total Promos"
              value={stats.promos}
              note="Global: jumlah data dari endpoint /promos"
              bgClass="bg-emerald-600"
              detailTo="/admin/promos"
            />
            <StatCard
              title="My Transactions"
              value={stats.transactions}
              note="Per akun: jumlah transaksi dari /my-transactions"
              bgClass="bg-amber-500"
              detailTo="/admin/transactions"
            />
            <StatCard
              title="Active User"
              value={stats.users}
              note="Per akun: 1 jika profile /user berhasil dimuat"
              bgClass="bg-slate-900"
              detailTo="/admin/users"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Activities &amp; Promos menggunakan data global dari API. Sementara
            &quot;My Transactions&quot; dan &quot;Active User&quot; saat ini
            masih berbasis akun yang sedang login karena tidak tersedia endpoint
            list global untuk transaksi dan users. Jika di masa depan disediakan
            endpoint admin khusus, kamu cukup mengganti pemanggilan API di file
            ini tanpa mengubah tampilan dashboard.
          </p>
        </section>
      </PageContainer>
    </AdminLayout>
  );
}
