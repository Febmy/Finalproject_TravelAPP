// src/pages/user/Profile.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { showToast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // API Travel Journal menyediakan GET /user (bukan PUT)
        const res = await api.get("/user");
        setUser(res.data.data);
      } catch (err) {
        console.error("Profile error:", err.response?.data || err.message);
        const msg = "Gagal memuat data profil.";
        setError(msg);
        showToast({ type: "error", message: msg });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [showToast]);

  // ===== STATE: LOADING =====
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="h-32 rounded-3xl bg-slate-200 animate-pulse" />
        <div className="h-40 rounded-3xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  // ===== STATE: ERROR =====
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <p className="text-sm text-slate-600">
          Pastikan kamu sudah login dan token masih valid.
        </p>
      </div>
    );
  }

  // SAFETY: kalau masih belum ada user
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm text-slate-600">Data profil tidak ditemukan.</p>
      </div>
    );
  }

  // ===== NORMALISASI DATA =====
  const name = user.name || "Traveler";
  const email = user.email || "-";
  const phone = user.phoneNumber || user.phone || "-";
  const role = user.role || "user";
  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  // ===== UI =====
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER CARD */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-semibold">
          {initials || "U"}
        </div>

        <div className="flex-1 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Profile
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            {name}
          </h1>
          <p className="text-sm text-slate-600">{email}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {role === "admin" ? "Admin" : "Regular User"}
            </span>
            {createdAt && (
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500">
                Member sejak {createdAt}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* DETAIL INFO */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Personal Info</h2>

        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              Full Name
            </p>
            <p className="font-medium text-slate-900">{name}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              Email
            </p>
            <p className="font-medium text-slate-900 break-all">{email}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              Phone
            </p>
            <p className="font-medium text-slate-900">{phone}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              Role
            </p>
            <p className="font-medium text-slate-900 capitalize">{role}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Data diambil dari endpoint <code>/user</code>.
        </p>
      </section>
    </div>
  );
}
