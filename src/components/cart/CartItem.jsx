// src/components/CartItem.jsx
import { formatCurrency } from "../../lib/format.js";

function getCartItemImage(item) {
  const act = item?.activity || {};

  return (
    act.imageUrl ||
    (Array.isArray(act.imageUrls) && act.imageUrls[0]) ||
    act.thumbnail ||
    "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200"
  );
}

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  if (!item) return null;

  const qty = item.quantity || 1;
  const price = item.activity?.price || 0;
  const total = price * qty;
  const title = item.activity?.title || "Activity";
  const desc = item.activity?.description || "Aktivitas pilihanmu.";
  const imageUrl = getCartItemImage(item);

  return (
    <article className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-3 md:p-4 shadow-sm">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-slate-100 shrink-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
        <div className="space-y-1 min-w-0">
          <p className="text-sm md:text-base font-semibold text-slate-900 truncate">
            {title}
          </p>
          <p className="text-xs text-slate-500 line-clamp-1">{desc}</p>
          <p className="text-xs text-slate-500">
            {formatCurrency(price)} x {qty}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1">
            <button
              type="button"
              onClick={onDecrease}
              className="w-6 h-6 rounded-full bg-white text-xs flex items-center justify-center border border-slate-200"
            >
              -
            </button>
            <span className="text-xs md:text-sm font-medium min-w-[20px] text-center">
              {qty}
            </span>
            <button
              type="button"
              onClick={onIncrease}
              className="w-6 h-6 rounded-full bg-white text-xs flex items-center justify-center border border-slate-200"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="text-[11px] text-red-600 hover:text-red-700 hover:underline"
          >
            Hapus
          </button>

          <p className="text-xs font-semibold text-slate-900">
            {formatCurrency(total)}
          </p>
        </div>
      </div>
    </article>
  );
}
