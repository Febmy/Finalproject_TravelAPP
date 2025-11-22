// src/pages/user/Home.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api.js";
import { formatCurrency } from "../../lib/format.js";
// ===== HELPER GAMBAR AKTIVITAS =====
const FALLBACK_ACTIVITY_IMAGE =
  "https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&w=1200";

function getActivityImage(act) {
  return (
    act?.imageUrl ||
    (Array.isArray(act?.imageUrls) && act.imageUrls[0]) ||
    act?.thumbnail ||
    FALLBACK_ACTIVITY_IMAGE
  );
}

export default function Home() {
  const [promos, setPromos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [pRes, aRes, cRes] = await Promise.all([
          api.get("/promos"),
          api.get("/activities?limit=8"),
          api.get("/categories"),
        ]);

        setPromos(pRes.data?.data || []);
        setActivities(aRes.data?.data || []);
        setCategories(cRes.data?.data || []);
      } catch (err) {
        console.error("Homepage error:", err.response?.data || err.message);
        setError("Gagal memuat data homepage.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ===== DATA PROMO & HERO =====
  const heroPromo = promos[0] || null;

  const heroImage =
    heroPromo?.imageUrl ||
    (Array.isArray(heroPromo?.imageUrls) && heroPromo.imageUrls[0]) ||
    "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200";

  const heroPromoCode = heroPromo?.promo_code;
  const heroMinPrice = heroPromo?.minimum_claim_price;
  const heroDiscount = heroPromo?.promo_discount_price;

  const topActivities = activities.slice(0, 6);
  const topCategories = categories.slice(0, 6);

  // ===== STATE: LOADING & ERROR =====
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
          <div className="h-52 md:h-64 rounded-3xl bg-slate-200 animate-pulse" />
          <div className="h-32 rounded-3xl bg-slate-200 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // ===== UI =====
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-16">
        {/* ================= HERO (tanpa collage) ================= */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] uppercase tracking-[0.18em] text-slate-500 shadow-sm">
            TravelApp
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            Smart Travel Companion
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold leading-tight text-slate-900">
              Visit The Most{" "}
              <span className="text-sky-600">Beautiful Places</span> In The
              World
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-xl">
              Plan and book your perfect trip with expert advice, destination
              information, and special promos from Travel Journal API.
            </p>
          </div>

          {/* ==== BANNER PROMO BESAR ==== */}
          {heroPromo ? (
            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden">
              <div className="p-5 md:p-6 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Promo
                </p>
                <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                  {heroPromo.title}
                </h2>

                {heroPromo.description && (
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    {heroPromo.description}
                  </p>
                )}

                {/* Tag kode + min transaksi + diskon */}
                <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                  {heroPromoCode && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900 text-white font-mono">
                      Kode: {heroPromoCode}
                    </span>
                  )}
                  {heroMinPrice && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      Min. Transaksi {formatCurrency(heroMinPrice)}
                    </span>
                  )}
                  {heroDiscount && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      Diskon {formatCurrency(heroDiscount)}
                    </span>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/activity")}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-900 text-white text-xs md:text-sm font-medium hover:bg-slate-800"
                  >
                    Lihat aktivitas
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/promos")}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-200 text-slate-700 text-xs md:text-sm hover:bg-slate-50"
                  >
                    Lihat semua promo
                  </button>
                </div>
              </div>

              {/* Gambar besar di bawah */}
              <div className="relative w-full pt-[50%] bg-slate-100">
                <img
                  src={heroImage}
                  alt={heroPromo.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_ACTIVITY_IMAGE;
                  }}
                />
              </div>
            </div>
          ) : (
            // fallback kalau belum ada promo
            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 p-5 md:p-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-2">
                Promo
              </p>
              <p className="text-xs md:text-sm text-slate-500">
                Belum ada promo yang aktif. Coba lagi nanti ya ✈️
              </p>
            </div>
          )}
        </section>

        {/* ================= BRANDS / REGION MARQUEE ================= */}
        <section className="border-y bg-white" aria-label="Brands">
          <div className="overflow-hidden">
            <div className="flex gap-12 py-6 whitespace-nowrap brands-marquee">
              {[
                "INDONESIA",
                "JEPANG",
                "KOREA",
                "CHINA",
                "THAILAND",
                "FRANCE",
                "BALI",
                "EUROPE",
              ].map((b, i) => (
                <span
                  key={i}
                  className="text-gray-500 text-sm tracking-widest uppercase"
                >
                  {b}
                </span>
              ))}
              {[
                "INDONESIA",
                "JEPANG",
                "KOREA",
                "CHINA",
                "THAILAND",
                "FRANCE",
                "BALI",
                "EUROPE",
              ].map((b, i) => (
                <span
                  key={"d-" + i}
                  className="text-gray-500 text-sm tracking-widest uppercase"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ================= WHY CHOOSE US ================= */}
        <section id="features" className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Why travel with TravelApp?
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
              Travel smarter dengan rekomendasi destinasi, promo eksklusif, dan
              pengalaman pemesanan yang simpel.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Curated Destinations",
                desc: "Aktivitas pilihan yang diambil dari Travel Journal API dengan rating terbaik.",
                icon: "🌍",
              },
              {
                title: "Best Deals",
                desc: "Promo menarik di berbagai kota dan negara untuk liburan lebih hemat.",
                icon: "💸",
              },
              {
                title: "Flexible Schedule",
                desc: "Jadwal aktivitas yang bisa disesuaikan dengan rencana perjalananmu.",
                icon: "📅",
              },
              {
                title: "Secure Booking",
                desc: "Transaksi aman dan transparan, seluruh data diambil langsung dari API.",
                icon: "🔒",
              },
            ].map((f, idx) => (
              <div
                key={idx}
                className="rounded-2xl border bg-white p-5 flex flex-col gap-2 shadow-sm"
              >
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-1 font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= CATEGORIES ================= */}
        <section id="categories" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                Categories
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Here are lots of interesting destinations grouped by category.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/activity")}
              className="text-xs md:text-sm text-sky-600 hover:text-sky-700"
            >
              Explore all
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {(topCategories.length
              ? topCategories
              : [
                  { id: "1", name: "Beach" },
                  { id: "2", name: "Mountain" },
                  { id: "3", name: "City" },
                ]
            ).map((cat, idx) => (
              <div
                key={cat.id || idx}
                className="shrink-0 w-24 md:w-28 flex flex-col items-center gap-2"
              >
                <div className="w-24 h-28 md:w-28 md:h-32 rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                  <img
                    src={
                      cat.imageUrl ||
                      "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    }
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1200";
                    }}
                  />
                </div>
                <p className="text-xs md:text-sm font-medium text-slate-700">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= POPULAR DESTINATIONS ================= */}
        <section id="popular" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                Popular Destinations
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Spot terbaik dari Travel Journal API yang bisa kamu pesan.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 rounded-full border border-slate-200 text-slate-500 text-xs">
                -
              </button>
              <button className="w-7 h-7 rounded-full bg-sky-600 text-white text-xs">
                +
              </button>
            </div>
          </div>

          {topActivities.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada aktivitas yang tersedia.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {topActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col overflow-hidden"
                >
                  <div className="h-40 bg-slate-100 overflow-hidden">
                    <img
                      src={getActivityImage(act)}
                      alt={act.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_ACTIVITY_IMAGE;
                      }}
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="text-sm md:text-base font-semibold text-slate-900 line-clamp-2">
                        {act.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {act.description ||
                          "Exciting experience for your next trip."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm md:text-base font-semibold text-slate-900">
                        {formatCurrency(act.price || 0)}
                      </p>
                      <Link
                        to={`/activity/${act.id}`}
                        className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-sky-600 text-white hover:bg-sky-700"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= FEATURE BLOCKS ================= */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Book Car</h3>
            <p className="text-xs md:text-sm text-slate-500">
              Rencanakan perjalanan lebih fleksibel dengan menyewa mobil di
              destinasi pilihanmu.
            </p>
            <button
              type="button"
              onClick={() => navigate("/activity")}
              className="mt-auto inline-flex items-center gap-1 text-xs md:text-sm text-sky-600 hover:text-sky-700"
            >
              Explore more <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Book Hotel</h3>
            <p className="text-xs md:text-sm text-slate-500">
              Temukan penginapan yang nyaman dekat dengan aktivitas yang kamu
              pesan.
            </p>
            <button
              type="button"
              onClick={() => navigate("/activity")}
              className="mt-auto inline-flex items-center gap-1 text-xs md:text-sm text-sky-600 hover:text-sky-700"
            >
              Explore more <span aria-hidden="true">↗</span>
            </button>
          </div>
        </section>

        {/* ================= CLIENT REVIEW ================= */}
        <section
          id="review"
          className="grid gap-6 md:grid-cols-[1.1fr,1.2fr] items-center"
        >
          <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-sm flex items-center gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-200 overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3760853/pexels-photo-3760853.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Happy traveler"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Client Review
              </h3>
              <p className="mt-1 text-xs md:text-sm text-slate-500">
                “TravelApp membantu saya menemukan aktivitas dan promo yang pas,
                tanpa perlu buka banyak website.”
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                — Febmy, TravelApp user
              </p>
            </div>
          </div>

          <div className="bg-sky-50 rounded-3xl border border-sky-100 p-5 md:p-6 shadow-sm">
            <div className="text-3xl text-sky-500 mb-2">“</div>
            <p className="text-xs md:text-sm text-slate-700">
              Dengan mengerjakan final project ini, saya belajar bagaimana
              menghubungkan React app dengan API nyata, mengelola state untuk
              user dan admin, serta membuat UI yang responsif dan enak
              digunakan.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
