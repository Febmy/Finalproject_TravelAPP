// src/pages/user/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full px-4 py-10 text-center space-y-4">
        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
          Travel Bee
        </p>
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="text-sm text-slate-600">
          Halaman yang kamu cari tidak ditemukan atau sudah dipindahkan.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-black"
          >
            Kembali ke Home
          </Link>
          <Link
            to="/activity"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white hover:bg-slate-50"
          >
            Lihat Aktivitas
          </Link>
        </div>
      </div>
    </div>
  );
}
