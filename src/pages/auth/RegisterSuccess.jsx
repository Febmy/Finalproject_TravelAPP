// src/pages/auth/RegisterSuccess.jsx
import { useLocation, useNavigate } from "react-router-dom";

export default function RegisterSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  // email yang dikirim dari halaman Register (opsional)
  const email = location.state?.email || "";

  const goToLogin = () => {
    navigate("/login", { state: { email } });
  };

  const goToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-teal-900 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-xl">
        {/* KIRI: COPY */}
        <div className="px-8 md:px-10 py-8 flex flex-col justify-center">
          <p className="text-xs tracking-[0.22em] uppercase text-teal-500">
            TravelApp
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Akunmu berhasil dibuat 🎉
          </h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Sekarang kamu bisa login dan mulai menjelajahi berbagai aktivitas
            dari <span className="font-semibold">Travel Journal API</span>.
            Pilih destinasi, tambah ke cart, dan selesaikan transaksi dalam satu
            alur yang rapi.
          </p>

          {email && (
            <p className="mt-3 text-xs text-slate-500">
              Kamu terdaftar dengan email{" "}
              <span className="font-semibold text-slate-900">{email}</span>.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={goToLogin}
              className="w-full inline-flex items-center justify-center rounded-xl bg-teal-600 text-white text-sm font-semibold py-2.5 hover:bg-teal-700"
            >
              Masuk sekarang
            </button>
            <button
              type="button"
              onClick={goToHome}
              className="w-full inline-flex items-center justify-center rounded-xl border border-slate-200 text-sm font-medium py-2.5 text-slate-700 hover:bg-slate-50"
            >
              Kembali ke Home
            </button>
          </div>

          <p className="mt-4 text-[11px] text-slate-400">
            Halaman ini hanya info setelah registrasi. Di production, kamu bisa
            menambahkan verifikasi email atau langkah onboarding lain di sini.
          </p>
        </div>

        {/* KANAN: ILLUSTRATION */}
        <div className="hidden md:block bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white p-8">
          <div className="h-full flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200">
                Welcome on board
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Satu akun untuk semua perjalananmu
              </h2>
              <p className="mt-3 text-sm text-teal-100 leading-relaxed">
                Simpan aktivitas favorit, kumpulkan transaksi, dan nikmati promo
                yang diambil langsung dari Travel Journal API.
              </p>
            </div>

            <div className="mt-6 text-xs text-teal-100/80 space-y-1">
              <p>✅ Booking aktivitas dalam beberapa klik</p>
              <p>✅ Riwayat transaksi yang rapi</p>
              <p>✅ Siap dikembangkan ke fitur loyalty / poin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
