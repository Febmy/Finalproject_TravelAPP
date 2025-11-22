// src/pages/user/Checkout.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatCurrency } from "../../lib/format.js";


export default function Checkout() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const [cartIds, setCartIds] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    note: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // PROMO STATE
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // ambil payment methods
        const pmRes = await api.get("/payment-methods");
        setPaymentMethods(pmRes.data.data || []);

        // ambil cart untuk dapatkan cartIds + detail buat subtotal
        const cartRes = await api.get("/carts");
        const carts = cartRes.data.data || [];

        setCartIds(carts.map((c) => c.id));
        setCartItems(carts);

        if (carts.length === 0) {
          const msg = "Keranjang kosong. Tambahkan aktivitas dulu.";
          setError(msg);
          showToast({
            type: "error",
            message: msg,
          });
        }
      } catch (err) {
        console.error(
          "Checkout init error:",
          err.response?.data || err.message
        );
        const msg = "Gagal memuat data checkout.";
        setError(msg);
        showToast({
          type: "error",
          message: msg,
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Hitung subtotal dari isi cart
  const subtotal = cartItems.reduce((sum, item) => {
    const price =
      item.totalPrice ??
      item.total_price ??
      item.price ??
      item.activity?.price ??
      0;
    const qty = item.quantity ?? 1;
    return sum + price * qty;
  }, 0);

  const grandTotal = Math.max(subtotal - discountAmount, 0);

  const isFormValid =
    form.fullName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    selectedMethod &&
    cartIds.length > 0;

  // Terapkan kode promo: cek ke /promos, validasi min transaksi, lalu hitung diskon
  const handleApplyPromo = async () => {
    const raw = promoCodeInput.trim();
    if (!raw) {
      showToast({
        type: "error",
        message: "Masukkan kode promo terlebih dahulu.",
      });
      return;
    }

    const codeToFind = raw.toUpperCase();

    try {
      setIsApplyingPromo(true);

      const res = await api.get("/promos");
      const promos = res.data?.data || [];

      const match = promos.find((p) => {
        const c = (p.promoCode || p.promo_code || "").toUpperCase();
        return c === codeToFind;
      });

      if (!match) {
        setAppliedPromo(null);
        setDiscountAmount(0);
        showToast({
          type: "error",
          message: "Kode promo tidak ditemukan.",
        });
        return;
      }

      const minPrice =
        match.minimumClaimPrice ?? match.minimum_claim_price ?? 0;
      const discount =
        match.promoDiscountPrice ?? match.promo_discount_price ?? 0;

      if (subtotal < minPrice) {
        setAppliedPromo(null);
        setDiscountAmount(0);
        showToast({
          type: "error",
          message: `Minimal transaksi untuk promo ini adalah ${formatCurrency(
            minPrice
          )}.`,
        });
        return;
      }

      setAppliedPromo(match);
      setDiscountAmount(Math.min(discount, subtotal));

      showToast({
        type: "success",
        message: `Promo ${codeToFind} berhasil diterapkan.`,
      });
    } catch (err) {
      console.error("Apply promo error:", err.response?.data || err.message);
      showToast({
        type: "error",
        message: "Gagal menerapkan promo. Coba beberapa saat lagi.",
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      const msg =
        "Lengkapi form, pilih metode pembayaran & pastikan keranjang terisi.";
      setError(msg);
      showToast({ type: "error", message: msg });
      return;
    }

    try {
      setSubmitting(true);

      // payload tetap sama agar tidak mengganggu API backend
      await api.post("/create-transaction", {
        cartIds,
        paymentMethodId: selectedMethod,
        // Kalau nanti API sudah support promo, bisa dipertimbangkan tambah:
        // promoCode: appliedPromo ? (appliedPromo.promoCode || appliedPromo.promo_code) : undefined,
      });

      showToast({
        type: "success",
        message: "Checkout berhasil! Transaksi sudah dibuat.",
      });

      navigate("/transactions");
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err.message);
      const msg = "Checkout gagal, coba lagi.";
      setError(msg);
      showToast({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex gap-2">
          <div className="h-2 w-10 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-2 w-10 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-2 w-10 rounded-full bg-slate-200 animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* tab bar kecil */}
      <div className="flex gap-2">
        <div className="h-2 w-10 rounded-full bg-slate-300" />
        <div className="h-2 w-10 rounded-full bg-slate-300" />
        <div className="h-2 w-10 rounded-full bg-slate-300" />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* FORM DATA USER */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm"
        >
          <h2 className="font-semibold mb-2 text-slate-900">Form</h2>
          <p className="text-xs text-slate-500 mb-2">
            Pastikan data kamu sudah benar sebelum melakukan pembayaran.
          </p>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="Nama lengkap sesuai identitas"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Nomor Telepon
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Catatan (opsional)
              </label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                placeholder="Catatan tambahan untuk perjalananmu..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className={`mt-4 w-full rounded-xl py-2 text-sm font-medium 
              ${
                !isFormValid || submitting
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-slate-900"
              } transition`}
          >
            {submitting ? "Processing..." : "Confirm Checkout"}
          </button>
        </form>

        {/* RINGKASAN + PAYMENT METHOD */}
        <section className="bg-slate-100 rounded-3xl p-6 space-y-4">
          <h2 className="font-semibold mb-2 text-slate-900">
            Ringkasan & Pembayaran
          </h2>
          <p className="text-xs text-slate-500 mb-2">
            Cek kembali total belanja dan pilih metode pembayaran yang kamu
            inginkan.
          </p>

          {/* Ringkasan pembayaran */}
          <div className="space-y-1 text-xs md:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">Diskon promo</span>
              <span className="font-medium text-emerald-700">
                {discountAmount > 0
                  ? `- ${formatCurrency(discountAmount)}`
                  : "-"}
              </span>
            </div>

            <div className="border-t border-slate-300 mt-2 pt-2 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total bayar</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Input Kode Promo */}
          <div className="space-y-2 pt-2 border-t border-slate-300">
            <label className="block text-[11px] font-medium text-slate-700">
              Kode Promo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCodeInput}
                onChange={(e) =>
                  setPromoCodeInput(e.target.value.toUpperCase())
                }
                placeholder="Masukkan kode promo"
                className="flex-1 rounded-full border border-slate-300 px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={isApplyingPromo || subtotal <= 0}
                className="px-3 md:px-4 py-2 rounded-full bg-slate-900 text-white text-xs md:text-sm disabled:bg-slate-400"
              >
                {isApplyingPromo ? "Menerapkan..." : "Gunakan"}
              </button>
            </div>

            {appliedPromo && (
              <p className="text-[11px] text-slate-600">
                Promo{" "}
                <span className="font-mono bg-slate-200 px-1 rounded">
                  {(
                    appliedPromo.promoCode ||
                    appliedPromo.promo_code ||
                    ""
                  ).toUpperCase()}
                </span>{" "}
                aktif. Min. transaksi{" "}
                {formatCurrency(
                  appliedPromo.minimumClaimPrice ??
                    appliedPromo.minimum_claim_price ??
                    0
                )}{" "}
                • Potongan{" "}
                {formatCurrency(
                  appliedPromo.promoDiscountPrice ??
                    appliedPromo.promo_discount_price ??
                    0
                )}
                .
              </p>
            )}
          </div>

          {/* Payment methods */}
          <div className="space-y-2 pt-2 border-t border-slate-300">
            <h3 className="text-xs font-medium text-slate-700">
              Metode Pembayaran
            </h3>
            <div className="space-y-2">
              {paymentMethods.map((pm) => (
                <label
                  key={pm.id}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={pm.id}
                    checked={selectedMethod === pm.id}
                    onChange={() => setSelectedMethod(pm.id)}
                    className="accent-slate-900"
                  />
                  {pm.imageUrl ? (
                    <img
                      src={pm.imageUrl}
                      alt={pm.name}
                      className="h-6 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-700">{pm.name}</span>
                  )}
                </label>
              ))}

              {paymentMethods.length === 0 && (
                <p className="text-xs text-slate-500">
                  Tidak ada metode pembayaran yang tersedia.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
