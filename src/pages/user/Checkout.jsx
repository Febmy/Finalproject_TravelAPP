// src/pages/user/Checkout.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useToast } from "../../context/ToastContext.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import CheckoutStepper from "../../components/ui/CheckoutStepper.jsx";
import { formatCurrency } from "../../lib/format.js";

// =====================
// LocalStorage helpers
// =====================
const TX_TOTALS_STORAGE_KEY = "travelapp_transaction_totals";

function loadTransactionTotals() {
  try {
    const raw = localStorage.getItem(TX_TOTALS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
    return {};
  } catch {
    return {};
  }
}

function saveTransactionTotals(map) {
  try {
    localStorage.setItem(TX_TOTALS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

// Promo kode hard-coded sesuai brief
const PROMO_CODES = {
  AKHIRTAHUN25: 150_000,
};

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const selectedCartIds = location.state?.selectedCartIds || [];

  const [loading, setLoading] = useState(false);
  const [carts, setCarts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);

  // -------------------------
  // Load carts & payment methods
  // -------------------------
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [cartRes, pmRes] = await Promise.all([
          api.get("/carts"),
          api.get("/payment-methods"),
        ]);

        const allCarts = cartRes.data?.data || [];
        const filtered =
          selectedCartIds.length > 0
            ? allCarts.filter((c) => selectedCartIds.includes(c.id))
            : allCarts;

        setCarts(filtered);
        setPaymentMethods(pmRes.data?.data || []);
      } catch (err) {
        console.error("Error load checkout data:", err.response?.data || err);
        showToast({
          type: "error",
          message: "Gagal memuat data checkout.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // Hitung subtotal, diskon, total
  // -------------------------
  const { subtotal, discount, totalToPay } = useMemo(() => {
    const sub = carts.reduce((sum, cart) => {
      const price = cart.activity?.price || 0;
      return sum + price * (cart.quantity || 1);
    }, 0);

    const disc = appliedPromoCode ? PROMO_CODES[appliedPromoCode] || 0 : 0;

    const total = Math.max(sub - disc, 0);

    return { subtotal: sub, discount: disc, totalToPay: total };
  }, [carts, appliedPromoCode]);

  // -------------------------
  // Promo handler
  // -------------------------
  function handleApplyPromo() {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    if (!PROMO_CODES[code]) {
      showToast({
        type: "error",
        message: "Kode promo tidak valid.",
      });
      return;
    }

    setAppliedPromoCode(code);
    showToast({
      type: "success",
      message: `Kode promo ${code} berhasil digunakan.`,
    });
  }

  // -------------------------
  // Confirm checkout
  // -------------------------
  async function handleConfirmCheckout() {
    if (loading) return;
    if (carts.length === 0) {
      showToast({
        type: "error",
        message: "Keranjang masih kosong.",
      });
      return;
    }
    if (!selectedPaymentMethodId) {
      showToast({
        type: "error",
        message: "Pilih metode pembayaran terlebih dahulu.",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        cartIds:
          selectedCartIds.length > 0 ? selectedCartIds : carts.map((c) => c.id),
        paymentMethodId: selectedPaymentMethodId,
        promoCode: appliedPromoCode ?? null,
        notes,
      };

      const res = await api.post("/create-transaction", payload);
      const newTx = res.data?.data;

      // Simpan total yang BENAR (totalToPay) ke localStorage
      if (newTx?.id) {
        const totalsMap = loadTransactionTotals();
        totalsMap[newTx.id] = totalToPay;
        saveTransactionTotals(totalsMap);
      }

      showToast({
        type: "success",
        message: "Transaksi berhasil dibuat.",
      });

      // PENTING: pastikan path ini sama dengan route di App.jsx
      // kalau route-mu adalah "/transactions", ganti di sini.
      navigate("/my-transactions");
    } catch (err) {
      console.error("Error create transaction:", err.response?.data || err);
      showToast({
        type: "error",
        message:
          err.response?.data?.errors ||
          err.response?.data?.message ||
          "Gagal membuat transaksi.",
      });
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // UI
  // -------------------------
  if (loading && carts.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (carts.length === 0) {
    return (
      <section className="space-y-4">
        <CheckoutStepper activeStep={2} />
        <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center">
          <p className="text-sm text-slate-500">
            Keranjangmu kosong. Silakan pilih aktivitas terlebih dahulu.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <CheckoutStepper activeStep={2} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.3fr)]">
        {/* FORM */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h1 className="text-lg font-semibold">Form</h1>
          <p className="text-xs text-slate-500">
            Pastikan data kamu sudah benar sebelum melanjutkan pembayaran.
          </p>

          <div className="space-y-3 mt-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Nama Lengkap</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500">Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500">Nomor Telepon</label>
              <input
                type="tel"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500">
                Catatan (opsional)
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[72px] focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan untuk perjalananmu..."
              />
            </div>
          </div>
        </div>

        {/* RINGKASAN & PEMBAYARAN */}
        <aside className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Ringkasan & Pembayaran</h2>

          <div className="border border-slate-100 rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Diskon promo</span>
              <span className="font-medium text-emerald-600">
                {discount > 0 ? `- ${formatCurrency(discount)}` : "-"}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-dashed border-slate-200 mt-1">
              <span className="font-semibold">Total bayar</span>
              <span className="font-semibold">
                {formatCurrency(totalToPay)}
              </span>
            </div>
          </div>

          {/* Input kode promo */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Kode Promo"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 uppercase"
              value={promoCodeInput}
              onChange={(e) => setPromoCodeInput(e.target.value)}
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
            >
              Gunakan
            </button>
          </div>

          {appliedPromoCode && (
            <p className="text-xs text-emerald-600">
              Promo <span className="font-semibold">{appliedPromoCode}</span>{" "}
              aktif. Potongan {formatCurrency(PROMO_CODES[appliedPromoCode])}.
            </p>
          )}

          {/* Pilih metode pembayaran */}
          <div className="space-y-2 pt-2">
            <p className="text-xs text-slate-500">Metode Pembayaran</p>

            <div className="space-y-2">
              {paymentMethods.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 cursor-pointer text-sm transition 
                    ${
                      selectedPaymentMethodId === pm.id
                        ? "border-slate-900 bg-slate-900/5"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="accent-slate-900"
                      checked={selectedPaymentMethodId === pm.id}
                      onChange={() => setSelectedPaymentMethodId(pm.id)}
                    />
                    <span>{pm.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Tombol konfirmasi */}
          <button
            type="button"
            onClick={handleConfirmCheckout}
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-slate-900 text-white text-sm font-medium py-2.5 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-slate-800"
          >
            {loading ? "Memproses..." : "Confirm Checkout"}
          </button>
        </aside>
      </div>
    </section>
  );
}
