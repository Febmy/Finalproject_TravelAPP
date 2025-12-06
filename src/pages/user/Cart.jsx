// src/pages/user/Cart.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { formatCurrency } from "../../lib/format.js";
import CartItem from "../../components/cart/CartItem.jsx";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/carts");
      const data = (res.data?.data || []).map((item) => ({
        ...item,
        quantity: item.quantity ?? 1,
      }));
      setItems(data);
    } catch (err) {
      console.error("Cart error:", err.response?.data || err.message);
      setError("Gagal memuat keranjang.");
      showToast({
        type: "error",
        message: "Gagal memuat keranjang.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // di atas: import api, useToast, dll

  const changeQty = async (id, delta) => {
    try {
      // cari item sekarang
      const current = items.find((it) => it.id === id);
      if (!current) return;

      const newQty = Math.max(1, (current.quantity || 1) + delta);

      // update ke server dulu
      await api.post(`/update-cart/${id}`, { quantity: newQty });

      // kalau sukses, update state + localStorage
      setItems((prev) => {
        const next = prev.map((it) =>
          it.id === id ? { ...it, quantity: newQty } : it
        );
        // simpan ke localStorage supaya kalau reload tetap
        try {
          const map = {};
          next.forEach((it) => {
            map[it.id] = it.quantity || 1;
          });
          localStorage.setItem(
            "travelapp_cart_quantities",
            JSON.stringify(map)
          );
        } catch {
          // ignore
        }
        return next;
      });
    } catch (err) {
      console.error(
        "Update cart quantity error:",
        err.response?.data || err.message
      );
      showToast({
        type: "error",
        message: "Gagal mengubah jumlah. Coba lagi sebentar.",
      });
    }
  };

  const handleClear = async () => {
    const ok = window.confirm("Hapus semua item di keranjang?");
    if (!ok) return;

    try {
      for (const item of items) {
        try {
          await api.delete(`/delete-cart/${item.id}`);
        } catch (err) {
          console.error(
            "Delete cart error (clear):",
            err.response?.data || err.message
          );
        }
      }
      setItems([]);
      showToast({
        type: "success",
        message: "Keranjang berhasil dikosongkan.",
      });
    } catch (err) {
      console.error("Clear cart error:", err.response?.data || err.message);
      showToast({
        type: "error",
        message: "Gagal mengosongkan keranjang.",
      });
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      showToast({
        type: "error",
        message: "Keranjang masih kosong.",
      });
      return;
    }
    navigate("/checkout");
  };

  const totalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.activity?.price || 0) * (item.quantity || 1),
    0
  );

  if (loading) {
    return (
      <section className="space-y-4">
        <header className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Cart</h1>
          <p className="text-sm text-slate-600">
            Memuat keranjang perjalananmu...
          </p>
        </header>
        <Spinner />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3">
        <header className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Cart</h1>
        </header>
        <p className="text-sm text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Cart</h1>
        <p className="text-sm text-slate-600">
          {items.length === 0
            ? "Keranjangmu masih kosong."
            : `Ada ${items.length} aktivitas dengan total ${totalQty} orang di keranjangmu.`}
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="Keranjangmu masih kosong."
          description="Mulai jelajahi aktivitas dan tambahkan ke keranjang untuk melanjutkan checkout."
        />
      ) : (
        <>
          <section className="space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrease={() => changeQty(item.id, 1)}
                onDecrease={() => changeQty(item.id, -1)}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Ringkasan
              </p>
              <p className="text-sm md:text-base font-semibold text-slate-900">
                Total {totalQty} orang, {formatCurrency(totalPrice)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
              >
                Kosongkan keranjang
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm hover:bg-slate-800"
              >
                Checkout
              </button>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
