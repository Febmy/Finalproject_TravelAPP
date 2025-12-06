// src/pages/auth/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

function validateEmail(email) {
  if (!email) return "Email wajib diisi.";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? "" : "Format email tidak valid.";
}
function validatePassword(pw) {
  if (!pw) return "Password wajib diisi.";
  return pw.length >= 6 ? "" : "Password minimal 6 karakter.";
}

function redirectByRole(navigate, profile) {
  const role = profile?.role || profile?.userRole || "";
  if (role === "admin") navigate("/admin", { replace: true });
  else navigate("/", { replace: true });
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const emailFromRegister = location.state?.email || "";
  const [email, setEmail] = useState(emailFromRegister);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // auto-redirect jika sudah login
  useEffect(() => {
    const token = localStorage.getItem("token");
    const rawProfile = localStorage.getItem("userProfile");
    if (!token || !rawProfile) return;
    try {
      const profile = JSON.parse(rawProfile);
      redirectByRole(navigate, profile);
    } catch {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    try {
      setSubmitting(true);
      const res = await api.post("/login", { email: email.trim(), password });
      const { token, data } = res.data || {};
      if (!token) throw new Error("Token tidak ditemukan di response login.");

      const rawUser = data || { email: email.trim() };
      const baseEmail = rawUser.email || email.trim();
      const displayName =
        rawUser.displayName ||
        rawUser.fullName ||
        rawUser.name ||
        rawUser.username ||
        (baseEmail ? baseEmail.split("@")[0] : "Traveler");

      const profile = { ...rawUser, displayName };

      localStorage.setItem("token", token);
      localStorage.setItem("userProfile", JSON.stringify(profile));

      showToast({ type: "success", message: "Login berhasil." });
      redirectByRole(navigate, profile);
    } catch (err) {
      const status = err.response?.status;
      const apiMessage = err.response?.data?.message;
      let msg;
      if (status === 400 || status === 401) {
        msg = "Email atau password salah. Silakan coba lagi.";
      } else if (apiMessage) {
        msg = apiMessage;
      } else {
        msg = "Login gagal. Silakan coba lagi beberapa saat lagi.";
      }
      showToast({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // --- UI dari bagian kedua ---
  return (
    <div className="min-h-screen bg-teal-900 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-xl">
        {/* KIRI: FORM */}
        <div className="px-6 py-8 md:px-10 md:py-10">
          <div className="mb-6">
            <p className="text-xs tracking-[0.2em] uppercase text-teal-500 font-semibold">
              TravelApp
            </p>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900">
              Welcome back 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Masuk untuk mengelola perjalananmu dan menikmati promo dari Travel Journal API.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Email</label>
              <input
                type="email"
                className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  emailError
                    ? "border-red-400 ring-red-200 focus:ring-red-500"
                    : "border-slate-200 focus:ring-teal-500 focus:border-teal-500"
                }`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {emailError && <p className="text-xs text-red-600">{emailError}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Password</label>
              <input
                type="password"
                className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  passwordError
                    ? "border-red-400 ring-red-200 focus:ring-red-500"
                    : "border-slate-200 focus:ring-teal-500 focus:border-teal-500"
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center rounded-xl bg-teal-600 text-white text-sm font-semibold py-2.5 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-500">
            Belum punya akun?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-teal-600 hover:underline"
            >
              Daftar sekarang
            </button>
          </p>
        </div>

        {/* KANAN: INFO */}
        <div className="hidden md:block bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white p-8">
          <div className="h-full flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Smart Travel</p>
              <h2 className="mt-3 text-2xl font-semibold">TravelApp x Travel Journal API</h2>
              <p className="mt-3 text-sm text-teal-100 leading-relaxed">
                Aplikasi ini terhubung dengan API Travel Journal untuk menampilkan aktivitas, promo,
                dan mengelola transaksi. Login sebagai <span className="font-semibold">admin</span>{" "}
                untuk mengelola data, atau sebagai <span className="font-semibold">user</span> untuk
                booking aktivitas.
              </p>
            </div>
            <div className="mt-6 text-xs text-teal-100/80 space-y-1">
              <p>✅ Role-based access (User vs Admin)</p>
              <p>✅ Protected routes & transaksi realtime</p>
              <p>✅ Integrasi penuh dengan Travel Journal API</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}