// src/pages/auth/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    "https://images.unsplash.com/photo-1633323755192-727a05c4013d?auto=format&fit=crop&w=400&q=80"
  );
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Kalau sudah login, jangan bisa register lagi
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // --- Validasi ringan ---
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast({
        type: "error",
        message: "Nama, email, dan password wajib diisi.",
      });
      return;
    }
    if (!email.includes("@")) {
      showToast({ type: "error", message: "Format email tidak valid." });
      return;
    }
    if (password.length < 6) {
      showToast({
        type: "error",
        message: "Password minimal 6 karakter.",
      });
      return;
    }
    if (password !== passwordRepeat) {
      showToast({
        type: "error",
        message: "Password dan konfirmasi password tidak sama.",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        passwordRepeat,
        role, // bisa dikunci ke "user" kalau mau
        profilePictureUrl: profilePictureUrl.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      const res = await api.post("/register", payload);
      console.log("Register success:", res.data);

      showToast({
        type: "success",
        message: "Registrasi berhasil. Silakan login.",
      });

      // auto isi email di halaman login
      navigate("/login", { state: { email } });
    } catch (err) {
      const data = err.response?.data;
      console.error("Register error:", data || err);

      let message = "Registrasi gagal. Cek kembali data yang kamu isi.";
      if (data) {
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          const first = data.errors[0];
          if (typeof first === "string") message = first;
          else if (first?.message) message = first.message;
        } else if (data.message) {
          // contoh: 409 "Email already taken"
          message = data.message;
        }
      }

      showToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-900 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-xl">
        {/* KIRI: FORM */}
        {/* ========== KIRI: FORM ========== */}
        <div className="px-8 md:px-10 py-8 flex flex-col">
          {/* Brand + tab login/signup */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase text-slate-500">
                TravelApp
              </p>
              <p className="text-[11px] text-slate-400">
                Explore more. Experience life.
              </p>
            </div>
            {/* <div className="inline-flex rounded-full border border-slate-200 p-1 text-xs">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-3 py-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                Log In
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-full bg-slate-900 text-white"
              >
                Sign Up
              </button>
            </div> */}
          </div>

          <h1 className="text-xl md:text-2xl font-semibold text-slate-900 mb-1">
            Begin Your Adventure
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mb-6">
            Buat akun baru untuk mulai memesan aktivitas dan menikmati promo
            dari TravelApp.
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Phone Number (opsional)
              </label>
              <input
                type="tel"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                placeholder="08xxxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            {/* <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Profile Picture URL (opsional)
              </label>
              <input
                type="url"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                placeholder="https://images.unsplash.com/..."
                value={profilePictureUrl}
                onChange={(e) => setProfilePictureUrl(e.target.value)}
              />
            </div> */}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Minimal 6 karakter.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                placeholder="Ulangi password"
                value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)}
              />
            </div>
            {/* 
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Role
              </label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/70 bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div> */}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-slate-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Let’s Start"}
            </button>
          </form>

          <p className="mt-4 text-[11px] text-slate-500">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-slate-900 font-medium">
              Login di sini
            </Link>
          </p>
        </div>

        {/* ========== KANAN: HERO IMAGE (seperti login) ========== */}
        <div className="relative bg-slate-900">
          <img
            src="https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Mountain travel"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 right-6 bg-white rounded-2xl shadow-md px-4 py-3 max-w-xs">
            <p className="text-[11px] font-semibold text-slate-900">
              Travel the World, Your Way!
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Explore destinasi impianmu dengan pengalaman yang tak terlupakan.
            </p>
          </div>
          <div className="absolute bottom-6 left-8 bg-black/50 text-white rounded-2xl px-4 py-3 max-w-xs">
            <p className="text-xs font-semibold">
              Escape the Ordinary, Embrace the Journey!
            </p>
            <p className="mt-1 text-[11px] text-slate-100">
              Start your adventure today with TravelApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
