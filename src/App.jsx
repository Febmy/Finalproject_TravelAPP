// src/App.jsx
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// LAYOUT
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";
import PageContainer from "./components/layout/PageContainer.jsx";

// USER PAGES
import Home from "./pages/user/Home.jsx";
import ActivityList from "./pages/user/ActivityList.jsx";
import ActivityDetail from "./pages/user/ActivityDetail.jsx";
import Cart from "./pages/user/Cart.jsx";
import Checkout from "./pages/user/Checkout.jsx";
import Transactions from "./pages/user/Transactions.jsx";
import Profile from "./pages/user/Profile.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import RegisterSuccess from "./pages/auth/RegisterSuccess.jsx";
import Promos from "./pages/user/Promos.jsx";
import NotFound from "./pages/user/NotFound.jsx";

// ADMIN PAGES
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminTransactions from "./pages/admin/AdminTransactions.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminActivities from "./pages/admin/AdminActivities.jsx";
import AdminPromos from "./pages/admin/AdminPromos.jsx";

// ================= GUARD COMPONENTS =================

// Proteksi route yang butuh login
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Proteksi route admin (butuh login + role = admin)
function RequireAdmin({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let role = "";
  try {
    const raw = localStorage.getItem("userProfile");
    if (raw) {
      const user = JSON.parse(raw);
      role = user.role || user.userRole || "";
    }
  } catch {
    role = "";
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Blokir admin supaya tidak bisa akses halaman user
function BlockAdminOnUserRoute({ children }) {
  const rawProfile = localStorage.getItem("userProfile");
  if (!rawProfile) return children;

  try {
    const profile = JSON.parse(rawProfile);
    if (profile?.role === "admin") {
      // kalau admin coba buka halaman user, lempar ke /admin
      return <Navigate to="/admin" replace />;
    }
  } catch (err) {
    console.error("Failed to parse userProfile", err);
  }

  return children;
}

// ================= PLACEHOLDER / EXTRA PAGES =================

function WishlistPage() {
  const navigate = useNavigate();

  const mockWishlist = [
    {
      id: 1,
      title: "Nusa Penida Island Hopping",
      location: "Bali, Indonesia",
      tag: "Beach · Day Trip",
      priceLabel: "Mulai dari Rp 850.000",
      imageUrl:
        "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
      id: 2,
      title: "Tokyo City Lights & Street Food Tour",
      location: "Tokyo, Jepang",
      tag: "City · Night Experience",
      priceLabel: "Mulai dari Rp 1.500.000",
      imageUrl:
        "https://images.pexels.com/photos/373290/pexels-photo-373290.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
      id: 3,
      title: "Seoul Autumn Foliage Experience",
      location: "Seoul, Korea Selatan",
      tag: "Nature · Seasonal",
      priceLabel: "Mulai dari Rp 1.200.000",
      imageUrl:
        "https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
  ];

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          Wishlist Perjalananmu
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Di final project ini, halaman wishlist berfungsi sebagai dummy page
          untuk menunjukkan navigasi, struktur fitur lanjutan, dan kemampuan
          aplikasi menyimpan rencana perjalanan favorit pengunjung.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {mockWishlist.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col overflow-hidden"
          >
            <div className="h-36 md:h-40 bg-slate-100 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col gap-2">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Wishlist item
                </p>
                <h2 className="text-sm md:text-base font-semibold text-slate-900 line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-xs text-slate-500">{item.location}</p>
                <p className="inline-flex items-center rounded-full bg-slate-100 text-[10px] text-slate-700 px-2 py-0.5">
                  {item.tag}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
                <p className="text-xs md:text-sm font-medium text-slate-900">
                  {item.priceLabel}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/activity")}
                  className="text-[11px] md:text-xs px-3 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800"
                >
                  Lihat aktivitas
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 md:p-5 text-xs md:text-sm text-slate-600">
        <p className="mb-1">
          Di versi production, wishlist akan berisi data dinamis dari API dan
          terhubung dengan akun user. Di final project ini, section ini
          menunjukkan bahwa:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Routing sudah mendukung halaman fitur lanjutan.</li>
          <li>
            UI card tetap konsisten dengan tampilan Activity & Popular
            Destinations.
          </li>
          <li>Struktur siap dikembangkan menjadi fitur penuh di masa depan.</li>
        </ul>
      </div>
    </section>
  );
}

function HelpCenterPage() {
  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          Help Center TravelApp
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Halaman ini menjadi pusat bantuan versi sederhana untuk final project
          TravelApp. Fokusnya adalah menjelaskan alur utama dan perbedaan peran
          user vs admin.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Kolom kiri: FAQ alur user */}
        <div className="rounded-2xl border bg-white p-4 md:p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Alur utama untuk user
          </h2>
          <div className="space-y-2 text-xs md:text-sm text-slate-600">
            <p className="font-medium">Bagaimana cara memesan aktivitas?</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Login atau register sebagai user.</li>
              <li>Pilih aktivitas dari halaman Activity atau Home.</li>
              <li>Tambah ke Cart, atur quantity & tanggal.</li>
              <li>Lanjut ke Checkout, pilih metode pembayaran.</li>
              <li>Setelah sukses, transaksi muncul di My Transactions.</li>
            </ol>

            <p className="font-medium mt-3">
              Di mana saya bisa melihat riwayat transaksi?
            </p>
            <p>
              Riwayat transaksi dapat dilihat di halaman{" "}
              <span className="font-semibold">My Transactions</span> dengan
              sorting terbaru duluan dan status yang jelas (pending, success,
              cancelled).
            </p>
          </div>
        </div>

        {/* Kolom kanan: Peran admin */}
        <div className="rounded-2xl border bg-white p-4 md:p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Peran Admin di Aplikasi
          </h2>
          <div className="space-y-2 text-xs md:text-sm text-slate-600">
            <p className="font-medium">
              Apa bedanya tampilan admin dengan user biasa?
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Admin memiliki akses ke halaman khusus: Dashboard, Activities,
                Promos, Transactions, dan Users.
              </li>
              <li>
                Navbar di mode admin menyembunyikan menu seperti Cart & Wishlist
                agar fokus ke pengelolaan data.
              </li>
              <li>
                User biasa hanya bisa mengakses halaman user dan tidak bisa
                masuk ke halaman admin.
              </li>
            </ul>

            <p className="font-medium mt-3">
              Kenapa ini penting untuk final project?
            </p>
            <p>
              Dengan pemisahan dunia User vs Admin, aplikasi menunjukkan
              pemahaman role-based access, proteksi route, dan struktur layout
              yang scalable untuk aplikasi production.
            </p>
          </div>
        </div>
      </div>

      <p className="text-[11px] md:text-xs text-slate-400">
        Catatan: seluruh konten di Help Center ini bersifat statis dan dibuat
        khusus untuk mendukung penjelasan saat demo final project.
      </p>
    </section>
  );
}

function NotificationsPage() {
  let notifCount = 0;
  try {
    const rawNotif = localStorage.getItem("travelapp_notification_count");
    const num = rawNotif ? Number(rawNotif) : 0;
    notifCount = Number.isNaN(num) ? 0 : num;
  } catch {
    notifCount = 0;
  }

  const hasNotif = notifCount > 0;

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">
          Notifikasi TravelApp
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Halaman ini terhubung dengan badge notifikasi di navbar untuk
          mensimulasikan fitur notifikasi pada aplikasi travel.
        </p>
      </header>

      <div className="rounded-2xl border bg-white p-4 md:p-5 space-y-3 text-sm text-slate-600">
        {hasNotif ? (
          <p>
            Kamu memiliki{" "}
            <span className="font-semibold">{notifCount} notifikasi</span> yang
            sedang ditandai di navbar. Di versi production, notifikasi ini bisa
            berisi perubahan status transaksi, promo baru, atau pengingat
            aktivitas.
          </p>
        ) : (
          <p>
            Saat ini belum ada notifikasi baru. Badge notifikasi di navbar akan
            tetap 0 dan halaman ini berfungsi sebagai tempat untuk menampilkan
            riwayat notifikasi di masa depan.
          </p>
        )}

        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Contoh timeline notifikasi
          </p>
          <ul className="space-y-2 text-xs md:text-sm">
            <li>
              <span className="font-semibold">[Sukses]</span> Pembayaran
              aktivitas &quot;Nusa Penida Island Hopping&quot; berhasil.
            </li>
            <li>
              <span className="font-semibold">[Reminder]</span> Aktivitas
              &quot;Tokyo City Lights&quot; akan dimulai besok pukul 19.00.
            </li>
            <li>
              <span className="font-semibold">[Promo]</span> Promo baru tersedia
              untuk destinasi Korea Selatan minggu ini.
            </li>
          </ul>
        </div>

        <p className="text-[11px] text-slate-400">
          Untuk final project, data di sini masih statis. Namun strukturnya
          sudah siap jika suatu saat ingin dihubungkan dengan API notifikasi
          sungguhan.
        </p>
      </div>
    </section>
  );
}

// ================= MAIN APP =================

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />

        <PageContainer>
          <Routes>
            {/* PUBLIC USER ROUTES */}
            <Route
              path="/"
              element={
                <BlockAdminOnUserRoute>
                  <Home />
                </BlockAdminOnUserRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <BlockAdminOnUserRoute>
                  <ActivityList />
                </BlockAdminOnUserRoute>
              }
            />
            <Route
              path="/activity/:id"
              element={
                <BlockAdminOnUserRoute>
                  <ActivityDetail />
                </BlockAdminOnUserRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-success" element={<RegisterSuccess />} />
            <Route
              path="/promos"
              element={
                <BlockAdminOnUserRoute>
                  <Promos />
                </BlockAdminOnUserRoute>
              }
            />

            {/* PROTECTED USER ROUTES */}
            <Route
              path="/cart"
              element={
                <BlockAdminOnUserRoute>
                  <RequireAuth>
                    <Cart />
                  </RequireAuth>
                </BlockAdminOnUserRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <BlockAdminOnUserRoute>
                  <RequireAuth>
                    <Checkout />
                  </RequireAuth>
                </BlockAdminOnUserRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <BlockAdminOnUserRoute>
                  <RequireAuth>
                    <Transactions />
                  </RequireAuth>
                </BlockAdminOnUserRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <BlockAdminOnUserRoute>
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                </BlockAdminOnUserRoute>
              }
            />

            {/* EXTRA USER PAGES */}
            <Route
              path="/wishlist"
              element={
                <BlockAdminOnUserRoute>
                  <RequireAuth>
                    <WishlistPage />
                  </RequireAuth>
                </BlockAdminOnUserRoute>
              }
            />
            {/* nav-mu kemungkinan pakai /help-center, jadi di sini */}
            <Route
              path="/help-center"
              element={
                <BlockAdminOnUserRoute>
                  <HelpCenterPage />
                </BlockAdminOnUserRoute>
              }
            />
            {/* alias /help -> redirect ke /help-center */}
            <Route
              path="/help"
              element={<Navigate to="/help-center" replace />}
            />
            <Route
              path="/notifications"
              element={
                <BlockAdminOnUserRoute>
                  <RequireAuth>
                    <NotificationsPage />
                  </RequireAuth>
                </BlockAdminOnUserRoute>
              }
            />

            {/* ADMIN ROUTES */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/transactions"
              element={
                <RequireAdmin>
                  <AdminTransactions />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RequireAdmin>
                  <AdminUsers />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/activities"
              element={
                <RequireAdmin>
                  <AdminActivities />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/promos"
              element={
                <RequireAdmin>
                  <AdminPromos />
                </RequireAdmin>
              }
            />

            {/* FALLBACK 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageContainer>

        {/* Footer hanya tampil di dunia user */}
        {!isAdminRoute && <Footer />}
      </div>
    </>
  );
}
