// src/components/layout/Navbar.jsx
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("");

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const { showToast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile"); // 🔹 bersihkan profile juga
    showToast({ type: "success", message: "Berhasil logout." });
    navigate("/login");
  };

  useEffect(() => {
    const loadCartCount = async () => {
      if (!token) {
        setCartCount(0);
        return;
      }
      try {
        const res = await api.get("/carts");
        const data = res.data.data || [];
        const totalQty = data.reduce(
          (sum, item) => sum + (item.quantity ?? 1),
          0
        );
        setCartCount(totalQty);
      } catch (err) {
        console.error(
          "Navbar cart count error:",
          err.response?.data || err.message
        );
      }
    };

    const loadUser = async () => {
      if (!token) {
        setUserName("");
        setUserRole("");
        localStorage.removeItem("userProfile");
        return;
      }
      try {
        const res = await api.get("/user");
        const data = res.data.data || {};
        setUserName(data.name || "");
        setUserRole(data.role || "");

        // 🔹 SIMPAN PROFILE UNTUK RequireAdmin
        localStorage.setItem("userProfile", JSON.stringify(data));
      } catch (err) {
        console.error("Navbar user error:", err.response?.data || err.message);
        setUserRole("");
        localStorage.removeItem("userProfile");
      }
    };

    loadCartCount();
    loadUser();
  }, [token, location.pathname]);

  const baseLink =
    "px-3 py-1.5 text-xs md:text-sm rounded-full border border-transparent hover:bg-slate-100";
  const activeLink = "bg-slate-900 text-white hover:bg-slate-900";
  const inactiveLink = "text-slate-700";

  return (
    <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* BRAND */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-sm md:text-base font-semibold tracking-tight text-slate-900"
          >
            TravelApp
          </Link>
        </div>

        {/* NAV LINKS (DESKTOP/TABLET) */}
        <nav className="hidden sm:flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : inactiveLink}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/activity"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : inactiveLink}`
            }
          >
            Activity
          </NavLink>
        </nav>

        {/* AKSI */}
        <div className="flex items-center gap-2">
          {!isLoggedIn ? (
            <>
              {/* MOBILE: TOMBOL MENU */}
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="inline-flex sm:hidden items-center justify-center text-xs px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Menu
              </button>

              {/* DESKTOP/TABLET: LOGIN & REGISTER */}
              <Link
                to="/login"
                className="hidden sm:inline-flex text-xs md:text-sm px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex text-xs md:text-sm px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {userName && (
                <span className="hidden md:inline text-xs text-slate-600 mr-1">
                  Hi, <span className="font-medium">{userName}</span>
                </span>
              )}

              {/* CART SELALU KELIHATAN (DESKTOP & MOBILE) */}
              <Link
                to="/cart"
                className="inline-flex items-center gap-1 text-xs md:text-sm px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cart
                {cartCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-slate-900 text-white text-[10px]">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* MOBILE: TOMBOL MENU */}
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="inline-flex sm:hidden items-center justify-center text-xs px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Menu
              </button>

              {/* DESKTOP/TABLET: ADMIN (JIKA ADMIN), PROFILE, TRANSACTIONS, LOGOUT */}
              {userRole === "admin" && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex text-xs md:text-sm px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Admin
                </Link>
              )}

              <Link
                to="/profile"
                className="hidden sm:inline-flex text-xs md:text-sm px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Profile
              </Link>

              <Link
                to="/transactions"
                className="hidden sm:inline-flex text-xs md:text-sm px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                My Transactions
              </Link>

              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex text-xs md:text-sm px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* MENU DROPDOWN KHUSUS MOBILE */}
      {isMenuOpen && (
        <nav className="sm:hidden border-t border-slate-200 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2 text-xs">
            <NavLink
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Home
            </NavLink>
            <NavLink
              to="/activity"
              onClick={() => setIsMenuOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Activity
            </NavLink>

            {!isLoggedIn && (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Register
                </NavLink>
              </>
            )}

            {isLoggedIn && (
              <>
                {userRole === "admin" && (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
                  >
                    Admin
                  </NavLink>
                )}

                <NavLink
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/transactions"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  My Transactions
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-1.5 rounded-lg text-left text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
