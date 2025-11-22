// src/components/AdminLayout.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("userProfile");
    if (!raw) return;
    try {
      setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  const menu = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/transactions", label: "Transaksi" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/activities", label: "Activities" }, // 🔹 baru
    { to: "/admin/promos", label: "Promos & Banner" }, // 🔹 baru
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP BAR */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Admin Panel
            </p>
            <h1 className="text-lg md:text-xl font-bold text-slate-900">
              {title || "Dashboard"}
            </h1>
          </div>
          {user && (
            <div className="text-right text-xs text-slate-500">
              <p className="font-semibold text-slate-700">{user.name}</p>
              <p className="uppercase tracking-[0.18em] text-[10px]">
                {user.role || "user"}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[220px,1fr]">
        {/* SIDEBAR */}
        <aside className="bg-white border border-slate-200 rounded-2xl p-3 h-fit">
          <nav className="space-y-1">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  "block px-3 py-2 text-sm rounded-xl transition " +
                  (isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100")
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-3 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              ← Kembali ke User App
            </button>
          </nav>
        </aside>

        {/* MAIN CARD */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm">
          {children}
        </section>
      </div>
    </div>
  );
}
