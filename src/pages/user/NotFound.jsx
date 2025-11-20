// src/pages/NotFound.jsx
export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-sm text-slate-600">
        Halaman yang kamu cari tidak ditemukan.
      </p>
      <a
        href="/"
        className="inline-block mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm"
      >
        Kembali ke Home
      </a>
    </div>
  );
}
