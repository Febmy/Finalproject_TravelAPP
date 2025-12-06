// src/components/layout/Navbar.jsx
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext.jsx";
import api from "../../lib/api.js";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // ==== Ambil profile dari localStorage ====
  useEffect(() => {
    try {
      const raw = localStorage.getItem("userProfile");
      if (!raw) {
        setProfile(null);
        setIsAdmin(false);
        return;
      }
      const user = JSON.parse(raw);
      setProfile(user);
      const role = user.role || user.userRole || "";
      setIsAdmin(role === "admin");
    } catch (err) {
      console.error("Failed to parse userProfile:", err);
      setProfile(null);
      setIsAdmin(false);
    }
  }, [location.pathname]);

  // ==== Ambil jumlah cart (user saja) ====
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isAdmin) {
      setCartCount(0);
      return;
    }

    let cancelled = false;

    async function fetchCartCount() {
      try {
        const res = await api.get("/carts");
        const carts = res.data?.data || [];
        const totalQty = carts.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );

        if (!cancelled) setCartCount(totalQty);
      } catch (err) {
        console.error(
          "Navbar: gagal ambil cart:",
          err.response?.data || err.message
        );
      }
    }

    fetchCartCount();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, location.pathname]);

  // ==== Ambil jumlah notifikasi dari /notifications ====
  useEffect(() => {
    const token = localStorage.getItem("token");

    // Tidak ada token = belum login → tidak perlu notif
    // Admin juga tidak perlu notif versi user
    if (!token || isAdmin) {
      setNotifCount(0);
      return;
    }

    let cancelled = false;

    async function fetchNotifCount() {
      try {
        // Pakai endpoint yang sudah ada
        const res = await api.get("/my-transactions");
        const list = res.data?.data || [];

        // Hitung transaksi yang masih pending
        const pending = list.filter((tx) => {
          const status = (tx.status || tx.paymentStatus || "").toLowerCase();
          return status === "pending";
        });

        const count = pending.length;

        if (!cancelled) {
          setNotifCount(count);
          // Simpan supaya halaman /notifications bisa baca
          localStorage.setItem("travelapp_notification_count", String(count));
        }
      } catch (err) {
        if (!cancelled) {
          setNotifCount(0);
        }
        console.error(
          "Navbar: gagal ambil transaksi untuk notif:",
          err.response?.data || err.message
        );
      }
    }

    fetchNotifCount();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, isAdmin]);

  // ==== Helper nama user ====
  const displayName =
    profile?.name ||
    profile?.fullName ||
    profile?.username ||
    profile?.email ||
    "Traveler";

  // ==== Logout ====
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("travelapp_notification_count");
    setProfile(null);
    setIsAdmin(false);
    setCartCount(0);
    setNotifCount(0);

    navigate("/login", { replace: true });
    showToast({
      type: "success",
      message: "Berhasil logout dari TravelApp.",
    });
  };

  const handleBellClick = () => {
    navigate("/notifications");
  };

  const userNavLinks = [
    { to: "/", label: "Home" },
    { to: "/activity", label: "Activity" },
    { to: "/promos", label: "Promo" }, // <== pastikan /promos, bukan /promo
  ];

  const adminNavLinks = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/activities", label: "Activities" },
    { to: "/admin/promos", label: "Promos" },
    { to: "/admin/transactions", label: "Transactions" },
    { to: "/admin/users", label: "Users" },
  ];

  const navLinks = isAdmin ? adminNavLinks : userNavLinks;

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            to={isAdmin ? "/admin" : "/"}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs font-semibold text-white">
              TA
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">TravelApp</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                {isAdmin ? "Admin Panel" : "Smart Travel"}
              </p>
            </div>
          </Link>
        </div>

        {/* Nav links (desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                classNames(
                  "text-sm px-2 py-1 rounded-full transition",
                  isActive
                    ? "text-slate-900 font-semibold"
                    : "text-slate-500 hover:text-slate-900"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Notif bell */}
          {isLoggedIn && (
            <button
              type="button"
              onClick={handleBellClick}
              className="relative w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50"
            >
              <span className="text-lg">🔔</span>
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>
          )}

          {/* Cart (user saja) */}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="relative flex items-center gap-2 text-xs md:text-sm bg-slate-900 text-white px-3 py-1.5 rounded-full hover:bg-slate-800"
            >
              <span role="img" aria-label="cart">
                🛒
              </span>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="ml-1 min-w-[1.3rem] h-[1.3rem] rounded-full bg-white text-slate-900 text-[11px] flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          )}

          {/* User dropdown / Login button */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 hover:bg-slate-50"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                    {isAdmin ? "Admin Panel" : "Traveler"}
                  </span>
                  <span className="text-xs font-medium text-slate-900 max-w-[7rem] truncate">
                    {displayName}
                  </span>
                </div>
                <span className="text-xs text-slate-400">▾</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-100 bg-white shadow-lg py-2 text-sm">
                  {isAdmin ? (
                    <>
                      <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        Admin Panel
                      </p>
                      <NavLink
                        to="/admin"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </NavLink>
                      <NavLink
                        to="/admin/activities"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Activities
                      </NavLink>
                      <NavLink
                        to="/admin/promos"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Promos
                      </NavLink>
                      <NavLink
                        to="/admin/transactions"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Transactions
                      </NavLink>
                      <NavLink
                        to="/admin/users"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Users
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        Traveler
                      </p>
                      <NavLink
                        to="/profile"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </NavLink>
                      <NavLink
                        to="/transactions"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Transactions
                      </NavLink>
                      <NavLink
                        to="/wishlist"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Wishlist
                      </NavLink>
                      <NavLink
                        to="/help"
                        className="block px-3 py-1.5 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Help Center
                      </NavLink>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 text-sm mt-1 border-t border-slate-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-xs md:text-sm font-medium text-slate-900 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-50"
            >
              Login / Register
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
