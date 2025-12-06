// src/pages/user/Notifications.jsx
import { useEffect, useState } from "react";
import api from "././lib/api.js";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const res = await api.get("/notifications", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        let items =
          res.data?.data ||
          res.data?.notifications ||
          res.data?.items ||
          res.data ||
          [];

        if (!Array.isArray(items) && Array.isArray(items?.items)) {
          items = items.items;
        }

        if (!Array.isArray(items)) {
          setNotifications([]);
        } else {
          setNotifications(items);
        }
      } catch (err) {
        console.error("Notifications error:", err.response?.data || err);
        setError("Gagal memuat notifikasi.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="py-10">
        <p className="text-sm text-slate-500">Memuat notifikasi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const hasData = notifications && notifications.length > 0;

  return (
    <div className="py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          Notifikasi TravelApp
        </h1>
        <p className="text-sm text-slate-600">
          Daftar notifikasi yang diambil dari endpoint{" "}
          <code className="bg-slate-100 px-1 rounded text-xs">
            /notifications
          </code>
          .
        </p>
      </header>

      {!hasData ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-600">
          Belum ada notifikasi yang tercatat. Nantinya notifikasi di sini bisa
          berisi perubahan status transaksi, promo baru, dan pengingat
          aktivitas.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, idx) => {
            const title = n.title || n.type || `Notifikasi #${idx + 1}`;
            const message =
              n.message || n.description || n.body || "Tidak ada deskripsi.";
            const createdAt = n.createdAt || n.created_at || n.date || n.time;

            return (
              <article
                key={n.id || idx}
                className="rounded-2xl border bg-white p-4 md:p-5 flex flex-col gap-1 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {title}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{message}</p>
                  </div>
                  {createdAt && (
                    <p className="text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        Catatan: struktur field notifikasi di-parse secara fleksibel (title,
        message, description, status, dll) supaya cocok dengan response API
        Travel Journal.
      </p>
    </div>
  );
}
