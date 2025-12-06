// src/pages/user/HelpCenter.jsx
import { Link } from "react-router-dom";

const FAQ_GROUPS = [
  {
    title: "Pembayaran & transaksi",
    items: [
      {
        q: "Kenapa status transaksi saya masih pending?",
        a: "Biasanya butuh waktu beberapa menit sampai bank meng-update status pembayaran. Jika lebih dari 30 menit masih pending, kamu bisa kirim bukti transfer melalui menu My Transactions lalu hubungi CS.",
      },
      {
        q: "Metode pembayaran apa saja yang tersedia?",
        a: "Saat ini TravelApp mendukung transfer virtual account BCA, BNI, Mandiri, dan BRI. Ke depan bisa ditambah e-wallet sesuai kebutuhan final project-mu.",
      },
    ],
  },
  {
    title: "Perubahan jadwal & refund",
    items: [
      {
        q: "Bisakah saya mengganti tanggal keberangkatan?",
        a: "Selama status masih pending / success + belum melewati batas H-3 keberangkatan, kamu bisa ajukan perubahan tanggal lewat My Transactions lalu klik tombol Help / Kontak CS.",
      },
      {
        q: "Bagaimana kebijakan refund di TravelApp?",
        a: "Kebijakan refund mengikuti masing-masing partner (hotel/operator tur). Sebagai simulasi final project, kamu bisa menampilkan ringkasan kebijakan di halaman detail aktivitas.",
      },
    ],
  },
  {
    title: "Akun & keamanan",
    items: [
      {
        q: "Saya lupa password, apa yang harus dilakukan?",
        a: "Untuk versi demo ini, fitur reset password biasanya belum terhubung email sungguhan. Jelaskan flow yang diinginkan (kirim link ke email pengguna) di dokumen final project.",
      },
      {
        q: "Apakah data saya aman?",
        a: "Pastikan API production nantinya menggunakan HTTPS dan token disimpan secara aman (HTTP-only cookie atau secure storage). Di FE, jangan pernah menaruh API key rahasia di kode.",
      },
    ],
  },
];

export default function HelpCenter() {
  return (
    <section className="space-y-8">
      {/* HEADER */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Help Center</h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Butuh bantuan terkait perjalananmu? Mulai dari status transaksi,
          perubahan jadwal, sampai ide pengembangan fitur buat final project,
          semuanya dirangkum di sini.
        </p>
      </header>

      {/* SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <input
          type="search"
          placeholder='Cari bantuan: "pending terus", "ganti jadwal", "refund", ...'
          className="w-full md:max-w-lg rounded-full border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900"
        />
        <p className="text-xs text-slate-400 md:ml-auto">
          *Search ini masih dummy – bisa kamu sambungkan ke backend / FAQ JSON
          nanti.
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* FAQ COLUMN */}
        <div className="space-y-6">
          {FAQ_GROUPS.map((group) => (
            <section key={group.title} className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                {group.title}
              </h2>

              <div className="space-y-2">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    className="group bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm open:shadow-sm"
                  >
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <span className="font-medium text-slate-900">
                        {item.q}
                      </span>
                      <span className="ml-3 text-xs text-slate-400 group-open:hidden">
                        ▼
                      </span>
                      <span className="ml-3 text-xs text-slate-400 hidden group-open:inline">
                        ▲
                      </span>
                    </summary>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CONTACT / SIDE CARD */}
        <aside className="space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-3">
            <h2 className="text-sm font-semibold">Masih butuh bantuan?</h2>
            <p className="text-xs text-slate-200">
              Tim support TravelApp (versi final project) siap membantu menjawab
              pertanyaan kamu terkait flow aplikasi, bug kecil, atau ide
              pengembangan fitur.
            </p>

            <div className="space-y-2 text-xs">
              <p>Email support (dummy):</p>
              <p className="font-mono break-all">
                support@travelapp-finalproject.com
              </p>
            </div>

            <Link
              to="/my-transactions"
              className="inline-flex items-center justify-center mt-2 px-4 py-2 rounded-full bg-white text-slate-900 text-xs font-medium hover:bg-slate-100"
            >
              Buka My Transactions
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 text-xs text-slate-600">
            <h3 className="text-sm font-semibold text-slate-900">
              Tips untuk dokumentasi final project
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Jelaskan flow lengkap dari Cart → Checkout → Transactions.
              </li>
              <li>
                Cantumkan contoh masalah umum (pending, gagal, refund) dan
                bagaimana aplikasi menanganinya.
              </li>
              <li>
                Masukkan screenshot halaman Help Center ini di laporan / slide
                presentasi sebagai bukti perhatian ke user support.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
