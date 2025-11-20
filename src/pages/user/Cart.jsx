// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { formatCurrency } from "../../lib/format.js";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { showToast } = useToast();

  // --- Helpers ---

  const getImage = (item) =>
    item.activity?.imageUrl ||
    (Array.isArray(item.activity?.imageUrls) && item.activity.imageUrls[0]) ||
    item.activity?.thumbnail ||
    "https://images.pexels.com/photos/672532/pexels-photo-672532.jpeg?auto=compress&cs=tinysrgb&w=1200";

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/carts");
      const data = (res.data.data || []).map((item) => ({
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

  const changeQty = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, (item.quantity || 1) + delta),
            }
          : item
      )
    );
  };

  const handleRemove = async (id) => {
    const ok = window.confirm("Hapus item ini dari keranjang?");
    if (!ok) return;

    try {
      await api.delete(`/delete-cart/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast({
        type: "success",
        message: "Item dihapus dari keranjang.",
      });
    } catch (err) {
      console.error("Delete cart error:", err.response?.data || err.message);
      showToast({
        type: "error",
        message: "Gagal menghapus item dari keranjang.",
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
    } catch {
      // error per-item sudah dilog
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

  // --- UI states ---

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

  // --- Normal render ---

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Cart</h1>
        <p className="text-sm text-slate-600">
          {items.length === 0
            ? "Keranjangmu masih kosong."
            : `Ada ${items.length} aktivitas dengan total ${totalQty} orang di keranjangmu.`}
        </p>
      </header>

      {/* CONTENT */}
      {items.length === 0 ? (
        <EmptyState
          title="Keranjangmu masih kosong."
          description="Mulai jelajahi aktivitas dan tambahkan ke keranjang untuk melanjutkan checkout."
        />
      ) : (
        <>
          {/* LIST ITEM */}
          <section className="space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-3 md:p-4 shadow-sm"
              >
                {/* avatar / image */}
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={getImage(item)}
                    alt={item.activity?.title || "Activity"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-semibold text-slate-900 truncate">
                    {item.activity?.title || "Activity"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatCurrency(item.activity?.price || 0)} x{" "}
                    {item.quantity || 1}
                  </p>
                </div>

                {/* quantity & remove */}
                <div className="flex flex-col items-end gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => changeQty(item.id, -1)}
                      className="w-6 h-6 rounded-full bg-white text-slate-700 text-sm flex items-center justify-center border border-slate-200"
                    >
                      -
                    </button>
                    <span className="text-xs md:text-sm font-medium min-w-[20px] text-center">
                      {item.quantity || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQty(item.id, 1)}
                      className="w-6 h-6 rounded-full bg-white text-slate-700 text-sm flex items-center justify-center border border-slate-200"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </section>

          {/* SUMMARY + BUTTONS */}
          <section className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-4">
            <p className="text-sm md:text-base text-slate-900 font-semibold">
              Total:{" "}
              <span className="font-semibold">
                {formatCurrency(totalPrice)}
              </span>
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-100"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => navigate("/activity")}
                className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-700 hover:bg-slate-100"
              >
                Activity
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
