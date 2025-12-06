// src/pages/user/Wishlist.jsx
import { Link } from "react-router-dom";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { formatCurrency } from "../../lib/format.js";

const RECOMMENDED_ACTIVITIES = [
  {
    id: "rec-1",
    title: "Sunset Getaway Bali",
    location: "Kuta, Bali",
    price: 5000000,
    imageUrl:
      "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200",
    duration: "3D2N",
  },
  {
    id: "rec-2",
    title: "Explore Labuan Bajo",
    location: "Labuan Bajo, NTT",
    price: 8250000,
    imageUrl:
      "https://images.pexels.com/photos/4603768/pexels-photo-4603768.jpeg?auto=compress&cs=tinysrgb&w=1200",
    duration: "4D3N",
  },
  {
    id: "rec-3",
    title: "Hidden Gems Yogyakarta",
    location: "Yogyakarta",
    price: 3200000,
    imageUrl:
      "https://images.pexels.com/photos/4603766/pexels-photo-4603766.jpeg?auto=compress&cs=tinysrgb&w=1200",
    duration: "2D1N",
  },
];

// NOTE:
// Untuk sekarang kita anggap belum ada wishlist beneran dari API,
// jadi selalu tampil empty state + rekomendasi.
const MOCK_WISHLIST = [];

export default function Wishlist() {
  const hasItems = MOCK_WISHLIST.length > 0;

  return (
    <section className="space-y-8">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Wishlist</h1>
        <p className="text-sm text-slate-500">
          Simpan aktivitas impianmu di sini, supaya gampang dicek lagi saat mau
          checkout final project liburanmu. ✈️
        </p>
      </header>

      {/* SEARCH / FILTER BAR SEDERHANA */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <input
          type="search"
          placeholder='Cari di wishlist: "Bali", "Labuan Bajo", "city tour"...'
          className="w-full md:max-w-md rounded-full border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900"
        />
        <p className="text-xs text-slate-400 md:ml-auto">
          *Integrasi filter & data asli bisa ditambah nanti dari API.
        </p>
      </div>

      {/* LIST WISHLIST / EMPTY STATE */}
      {hasItems ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MOCK_WISHLIST.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col">
                <div className="space-y-1">
                  <h2 className="font-semibold text-slate-900 text-sm md:text-base">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-500">{item.location}</p>
                  <p className="text-xs text-slate-500">
                    {item.duration} •{" "}
                    <span className="font-semibold">
                      {formatCurrency(item.price)}
                    </span>
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Hapus dari wishlist
                  </button>
                  <Link
                    to={`/activity/${item.id}`}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Lihat detail
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Wishlist-mu masih kosong"
          description='Belum ada aktivitas yang disimpan. Jelajahi dulu semua aktivitas, lalu klik tombol "Tambah ke wishlist" di halaman detail.'
          action={
            <Link
              to="/activity"
              className="inline-flex items-center px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
            >
              Jelajahi aktivitas
            </Link>
          }
        />
      )}

      {/* REKOMENDASI */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Rekomendasi buat masuk wishlist
          </h2>
          <Link
            to="/activity"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Lihat semua aktivitas
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {RECOMMENDED_ACTIVITIES.map((act) => (
            <article
              key={act.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="h-32 w-full overflow-hidden bg-slate-100">
                <img
                  src={act.imageUrl}
                  alt={act.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-3 space-y-1">
                <h3 className="text-xs font-semibold text-slate-900 line-clamp-2">
                  {act.title}
                </h3>
                <p className="text-[11px] text-slate-500">{act.location}</p>
                <p className="text-[11px] text-slate-500">
                  {act.duration} •{" "}
                  <span className="font-semibold">
                    {formatCurrency(act.price)}
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
