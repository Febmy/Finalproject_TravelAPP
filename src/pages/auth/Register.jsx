// src/pages/auth/Register.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

function validateName(name) {
  if (!name) return "Nama wajib diisi.";
  return name.trim().length >= 2 ? "" : "Nama terlalu pendek.";
}
function validateEmail(email) {
  if (!email) return "Email wajib diisi.";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? "" : "Format email tidak valid.";
}
function validatePhone(phone) {
  if (!phone) return "";
  // simple numeric check (opsional)
  const re = /^[0-9+\-\s()]{6,20}$/;
  return re.test(phone) ? "" : "Nomor telepon tidak valid.";
}
function validatePassword(pw) {
  if (!pw) return "Password wajib diisi.";
  return pw.length >= 6 ? "" : "Password minimal 6 karakter.";
}
function validatePasswordMatch(pw, pw2) {
  if (!pw2) return "Konfirmasi password wajib diisi.";
  return pw === pw2 ? "" : "Password dan konfirmasi tidak sama.";
}

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const [loading, setLoading] = useState(false);

  // field errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordRepeatError, setPasswordRepeatError] = useState("");

  useEffect(() => {
    // redirect away if already logged in
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  // live handlers that also validate
  const onName = (v) => {
    setName(v);
    setNameError(validateName(v));
  };
  const onEmail = (v) => {
    setEmail(v);
    setEmailError(validateEmail(v));
  };
  const onPhone = (v) => {
    setPhoneNumber(v);
    setPhoneError(validatePhone(v));
  };
  const onPassword = (v) => {
    setPassword(v);
    setPasswordError(validatePassword(v));
    // also revalidate match
    setPasswordRepeatError(validatePasswordMatch(v, passwordRepeat));
  };
  const onPasswordRepeat = (v) => {
    setPasswordRepeat(v);
    setPasswordRepeatError(validatePasswordMatch(password, v));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // final validation
    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const phErr = validatePhone(phoneNumber);
    const pwErr = validatePassword(password);
    const prErr = validatePasswordMatch(password, passwordRepeat);

    setNameError(nErr);
    setEmailError(eErr);
    setPhoneError(phErr);
    setPasswordError(pwErr);
    setPasswordRepeatError(prErr);

    if (nErr || eErr || phErr || pwErr || prErr) return;

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        profilePictureUrl: profilePictureUrl.trim() || undefined,
        password,
        passwordRepeat,
        role: "user",
      };

      const res = await api.post("/register", payload);
      console.log("Register success:", res.data);

      showToast({
        type: "success",
        message: "Registrasi berhasil! Silakan lanjut ke login.",
      });

      // arah ke halaman success (kirim email lewat state)
      navigate("/register-success", { state: { email: email.trim() } });
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);
      const data = err.response?.data;
      let message = "Registrasi gagal. Cek kembali data yang kamu isi.";
      if (data?.message) message = data.message;
      else if (Array.isArray(data?.errors)) message = data.errors[0] || message;
      showToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-900 flex items-center justify-center px-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-xl">
        <div className="px-6 py-8 md:px-10 md:py-10">
          <p className="text-xs tracking-[0.2em] uppercase text-teal-500 font-semibold">
            TravelApp
          </p>
          <h1 className="mt-2 text-2xl md:text-3xl font-bold text-slate-900">
            Create your account ✨
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftar untuk mulai menyimpan wishlist, mengelola perjalanan, dan
            menikmati promo dari Travel Journal API.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-sm">
            {/* NAME */}
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => onName(e.target.value)}
                onBlur={(e) => setNameError(validateName(e.target.value))}
                className={`w-full rounded-xl px-3 py-2 text-sm focus:outline-none ${
                  nameError
                    ? "border border-red-400 ring-1 ring-red-200"
                    : "border border-slate-200 focus:ring-2 focus:ring-teal-500"
                }`}
                placeholder="Your full name"
                autoComplete="name"
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-600">{nameError}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => onEmail(e.target.value)}
                onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                className={`w-full rounded-xl px-3 py-2 text-sm focus:outline-none ${
                  emailError
                    ? "border border-red-400 ring-1 ring-red-200"
                    : "border border-slate-200 focus:ring-2 focus:ring-teal-500"
                }`}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-600">{emailError}</p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Phone (opsional)
              </label>
              <input
                value={phoneNumber}
                onChange={(e) => onPhone(e.target.value)}
                onBlur={(e) => setPhoneError(validatePhone(e.target.value))}
                className={`w-full rounded-xl px-3 py-2 text-sm focus:outline-none ${
                  phoneError
                    ? "border border-red-400 ring-1 ring-red-200"
                    : "border border-slate-200 focus:ring-2 focus:ring-teal-500"
                }`}
                placeholder="08xxxxxxxxxx"
                autoComplete="tel"
              />
              {phoneError && (
                <p className="mt-1 text-xs text-red-600">{phoneError}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => onPassword(e.target.value)}
                onBlur={(e) =>
                  setPasswordError(validatePassword(e.target.value))
                }
                className={`w-full rounded-xl px-3 py-2 text-sm focus:outline-none ${
                  passwordError
                    ? "border border-red-400 ring-1 ring-red-200"
                    : "border border-slate-200 focus:ring-2 focus:ring-teal-500"
                }`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {passwordError && (
                <p className="mt-1 text-xs text-red-600">{passwordError}</p>
              )}
            </div>

            {/* PASSWORD REPEAT */}
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                value={passwordRepeat}
                onChange={(e) => onPasswordRepeat(e.target.value)}
                onBlur={(e) =>
                  setPasswordRepeatError(
                    validatePasswordMatch(password, e.target.value)
                  )
                }
                className={`w-full rounded-xl px-3 py-2 text-sm focus:outline-none ${
                  passwordRepeatError
                    ? "border border-red-400 ring-1 ring-red-200"
                    : "border border-slate-200 focus:ring-2 focus:ring-teal-500"
                }`}
                placeholder="Ulangi password"
                autoComplete="new-password"
              />
              {passwordRepeatError && (
                <p className="mt-1 text-xs text-red-600">
                  {passwordRepeatError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center rounded-xl bg-teal-600 text-white text-sm font-semibold py-2.5 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-500">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-teal-600 hover:underline font-medium"
            >
              Masuk di sini
            </button>
          </p>
        </div>

        <div className="hidden md:block bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white p-8">
          <div className="h-full flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200">
                Smart Travel
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Mulai petualanganmu dengan TravelApp
              </h2>
              <p className="mt-3 text-sm text-teal-100 leading-relaxed">
                Buat akun sebagai <span className="font-semibold">user</span>{" "}
                untuk booking aktivitas, menyimpan wishlist, dan mengelola
                transaksi.
              </p>
            </div>

            <div className="mt-6 text-xs text-teal-100/80 space-y-1">
              <p>✅ Integrasi dengan Travel Journal API</p>
              <p>✅ Siap untuk role-based access (User vs Admin)</p>
              <p>✅ UI konsisten dengan halaman login</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
