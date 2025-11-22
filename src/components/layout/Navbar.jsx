// src/components/layout/Navbar.jsx
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext.jsx";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // ambil data user + cart dari localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("userProfile");
      if (raw) {
        const user = JSON.parse(raw);
        setUserName(user.name || "");
        setUserRole(user.role || "");
      } else {
        setUserName("");
        setUserRole("");
      }
    } catch {
      setUserName("");
      setUserRole("");
    }

    try {
      const rawCart = localStorage.getItem("cart");
      if (rawCart) {
        const cart = JSON.parse(rawCart);
        setCartCount(Array.isArray(cart) ? cart.length : 0);
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }

    // setiap pindah halaman, sidebar otomatis ditutup
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    showToast?.({ type: "success", message: "Berhasil logout." });
    navigate("/login");
  };

  const mainLinks = [
    { label: "Home", to: "/" },
    { label: "Activity", to: "/activity" },
    { label: "Promo", to: "/promos" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* BRAND */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
            TA
          </div>
          <div className="leading-tight text-left">
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              TravelApp
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
              Smart Travel
            </p>
          </div>
        </button>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive
                    ? "text-sky-600 border-b-2 border-sky-600 pb-1"
                    : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* DESKTOP RIGHT */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn && (
            <span className="text-xs text-slate-600">
              Hi,{" "}
              <span className="font-semibold">{userName || "Traveler"}</span>
              {userRole === "admin" && (
                <span className="ml-2 px-2 py-[2px] rounded-full bg-slate-900 text-white text-[10px] uppercase">
                  Admin
                </span>
              )}
            </span>
          )}

          {isLoggedIn ? (
            <>
              <NavLink
                to="/cart"
                className="px-3 py-1.5 rounded-full border text-xs text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
              >
                Cart
                {cartCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-slate-900 text-white text-[10px]">
                    {cartCount}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/transactions"
                className="px-3 py-1.5 rounded-full border text-xs text-slate-700 hover:bg-slate-50"
              >
                My Transactions
              </NavLink>
              <NavLink
                to="/profile"
                className="px-3 py-1.5 rounded-full border text-xs text-slate-700 hover:bg-slate-50"
              >
                Profile
              </NavLink>
              {userRole === "admin" && (
                <NavLink
                  to="/admin"
                  className="px-3 py-1.5 rounded-full border text-xs text-slate-700 hover:bg-slate-50"
                >
                  Admin
                </NavLink>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-medium hover:bg-black"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-3 py-1.5 rounded-full border text-xs text-slate-700 hover:bg-slate-50"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium hover:bg-black"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* MOBILE HAMBURGER */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-700"
          aria-label="Open menu"
        >
          <span className="sr-only">Open navigation</span>
          <div className="space-y-1">
            <span className="block h-[2px] w-4 bg-slate-800 rounded-full" />
            <span className="block h-[2px] w-4 bg-slate-800 rounded-full" />
          </div>
        </button>
      </nav>

      {/* MOBILE SIDEBAR: FULLSCREEN, TIDAK TRANSPARAN */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-white px-5 pt-5 pb-6 flex flex-col md:hidden">
          {/* header sidebar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                TA
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-tight text-slate-900">
                  TravelApp
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                  Smart Travel
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-600"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* user info */}
          {isLoggedIn && (
            <div className="mb-4 text-xs text-slate-600">
              Hi,{" "}
              <span className="font-semibold">{userName || "Traveler"}</span>
              {userRole === "admin" && (
                <span className="ml-2 px-2 py-[2px] rounded-full bg-slate-900 text-white text-[10px] uppercase">
                  Admin
                </span>
              )}
            </div>
          )}

          {/* MAIN LINKS */}
          <div className="space-y-1 mb-4">
            {mainLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* USER LINKS */}
          <div className="border-t border-slate-200 pt-4 space-y-1 text-sm">
            <NavLink
              to="/cart"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700"
            >
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-full bg-slate-900 text-white text-[11px]">
                  {cartCount}
                </span>
              )}
            </NavLink>

            {isLoggedIn && (
              <>
                <NavLink
                  to="/transactions"
                  onClick={() => setIsSidebarOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700"
                >
                  My Transactions
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => setIsSidebarOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700"
                >
                  Profile
                </NavLink>
                {userRole === "admin" && (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsSidebarOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* bottom area */}
          <div className="mt-auto pt-4 border-t border-slate-200 space-y-2">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  setIsSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-black"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    navigate("/login");
                  }}
                  className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2 text-sm hover:bg-slate-100"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSidebarOpen(false);
                    navigate("/register");
                  }}
                  className="flex-1 bg-slate-900 text-white rounded-xl py-2 text-sm font-medium hover:bg-black"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
