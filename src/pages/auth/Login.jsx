// src/pages/auth/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // kalau datang dari Register, state.email akan terisi
  const emailFromRegister = location.state?.email || "";

  const [email, setEmail] = useState(emailFromRegister);
  const [password, setPassword] = useState("");

  // kalau sudah login, langsung lempar ke home
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      showToast({ type: "error", message: "Email tidak valid." });
      return;
    }
    if (!password) {
      showToast({
        type: "error",
        message: "Password tidak boleh kosong.",
      });
      return;
    }

    try {
      const res = await api.post("/login", { email, password });

      // struktur dari API (sesuai Postman):
      // { code, status, message, data: {user}, token }
      const { token, data } = res.data || {};

      if (!token) {
        throw new Error("Token tidak ditemukan di response login.");
      }

      const user = data || { email };

      localStorage.setItem("token", token);
      localStorage.setItem("userProfile", JSON.stringify(user));

      showToast({ type: "success", message: "Login berhasil." });
      navigate("/");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      const msg =
        err.response?.data?.message ||
        "Login gagal. Periksa email dan password.";
      showToast({ type: "error", message: msg });
    }
  };

  return (
    <div className="min-h-screen bg-teal-900 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-xl">
        {/* KIRI: FORM */}
        <div className="px-6 py-8 md:px-10 md:py-10">
          <div className="mb-6">
            <p className="text-xs tracking-[0.2em] uppercase text-slate-400">
              TravelApp
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 mt-2">
              Journey Begins
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Login untuk melanjutkan pemesanan aktivitas dan melihat transaksi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 text-sm">
              <label className="block text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="space-y-1 text-sm">
              <label className="block text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium mt-2 hover:bg-slate-900 transition"
            >
              Log In
            </button>
          </form>

          <p className="mt-4 text-[11px] text-slate-500">
            Belum punya akun?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-sky-600 hover:underline"
            >
              Daftar sekarang
            </button>
          </p>
        </div>

        {/* KANAN: GAMBAR */}
        <div className="hidden md:block relative">
          <img
            src="https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Mountain travel"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-6 left-6 right-6 bg-black/40 text-white rounded-xl p-4 text-xs">
            <p className="font-semibold">
              Escape the Ordinary, Embrace the Journey!
            </p>
            <p className="mt-1 text-[11px] text-slate-100">
              Pengalaman perjalanan yang tak terlupakan dimulai dari sini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
