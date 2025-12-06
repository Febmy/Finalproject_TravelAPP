// src/components/activity/ActivityCard.jsx
import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/format.js";

const FALLBACK_ACTIVITY_IMAGE =
  "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200";

function getImageUrl(activity) {
  if (!activity) return FALLBACK_ACTIVITY_IMAGE;
  if (Array.isArray(activity.imageUrls) && activity.imageUrls.length > 0) {
    return activity.imageUrls[0];
  }
  if (activity.imageUrl) return activity.imageUrl;
  if (activity.thumbnail) return activity.thumbnail;
  return FALLBACK_ACTIVITY_IMAGE;
}

export default function ActivityCard({ activity }) {
  if (!activity) return null;

  const imageUrl = getImageUrl(activity);
  const title = activity.title || "Activity";
  const location = activity.location || "Flexible location";
  const categoryName = activity.category?.name || null;
  const price =
    activity.price != null
      ? formatCurrency(activity.price)
      : "Harga belum tersedia";

  return (
    <Link
      to={`/activity/${activity.id}`}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/60 rounded-3xl"
    >
      <article className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col overflow-hidden">
        {/* IMAGE */}
        <div className="relative h-44 md:h-52 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_ACTIVITY_IMAGE;
            }}
          />

          {/* CATEGORY BADGE */}
          {categoryName && (
            <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/90 backdrop-blur px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-100">
              {categoryName}
            </span>
          )}

          {/* PRICE BADGE */}
          <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-slate-900/90 text-white text-xs px-3 py-1 shadow-sm">
            {price}
          </span>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-4 space-y-2">
          <h3 className="text-sm md:text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-slate-950">
            {title}
          </h3>

          <p className="text-[11px] md:text-xs text-slate-500 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {location}
          </p>

          {activity.shortDescription && (
            <p className="text-[11px] md:text-xs text-slate-500 line-clamp-2">
              {activity.shortDescription}
            </p>
          )}
        </div>

        {/* FOOTER: INFO KECIL */}
        <div className="px-4 pb-3 pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
          <span>
            Durasi:{" "}
            <span className="font-medium">
              {activity.duration || "Flexible"}
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="font-medium">
              {activity.rating != null ? activity.rating.toFixed(1) : "4.8"}
            </span>
          </span>
        </div>
      </article>
    </Link>
  );
}
