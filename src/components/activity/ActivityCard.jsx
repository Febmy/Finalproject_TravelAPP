// src/components/ActivityCard.jsx
import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/format.js";

function getActivityImage(activity) {
  if (!activity) {
    return "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1200";
  }

  return (
    activity.imageUrl ||
    (Array.isArray(activity.imageUrls) && activity.imageUrls[0]) ||
    activity.thumbnail ||
    "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1200"
  );
}

export default function ActivityCard({ activity }) {
  if (!activity) return null;

  const { id, title, description, location, category, price } = activity;
  const imageUrl = getActivityImage(activity);

  return (
    <Link
      to={`/activity/${id}`}
      className="flex gap-3 md:gap-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition shadow-xs p-3 md:p-4"
    >
      <div className="w-24 h-24 md:w-32 md:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <h2 className="text-sm md:text-base font-semibold text-slate-900">
            {title}
          </h2>

          {location && (
            <p className="text-[11px] md:text-xs text-slate-500">{location}</p>
          )}

          <div className="flex flex-wrap items-center gap-1 mt-1">
            {category?.name && (
              <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5">
                {category.name}
              </span>
            )}

            {price != null && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5">
                {formatCurrency(price)}
              </span>
            )}
          </div>
        </div>

        <p className="text-[11px] md:text-xs text-slate-500 line-clamp-2 mt-1">
          {description || "Aktivitas seru untuk perjalananmu."}
        </p>
      </div>
    </Link>
  );
}
