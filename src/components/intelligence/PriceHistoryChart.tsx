import { formatDate, formatLakhs } from "@/lib/utils";
import type { PriceHistoryPoint, PriceSignals } from "@/lib/intelligence";

export function PriceHistoryChart({
  history,
  signals,
}: {
  history: PriceHistoryPoint[];
  signals: PriceSignals | null;
}) {
  if (history.length < 2) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        No prior auction history for this property yet.
      </div>
    );
  }

  const points = [...history].reverse();
  const values = points
    .map((p) => p.reserve_price_lakhs)
    .filter((v): v is number => v != null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 320;
  const height = 80;
  const pad = 8;

  const coords = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">Reserve price history</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {signals?.is_relisting && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-800 ring-1 ring-blue-200">
              Re-listed ({signals.auction_count} auctions)
            </span>
          )}
          {signals?.price_drop_pct != null && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800 ring-1 ring-emerald-200">
              Price drop {signals.price_drop_pct}%
            </span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-md text-slate-900"
        role="img"
        aria-label="Reserve price history chart"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          points={coords.join(" ")}
          className="text-slate-700"
        />
        {coords.map((c, i) => {
          const [x, y] = c.split(",").map(Number);
          return <circle key={i} cx={x} cy={y} r="3" className="fill-slate-900" />;
        })}
      </svg>

      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>
          {formatDate(points[0]?.auction_date)} — {formatLakhs(points[0]?.reserve_price_lakhs)}
        </span>
        <span>
          {formatDate(points[points.length - 1]?.auction_date)} —{" "}
          {formatLakhs(points[points.length - 1]?.reserve_price_lakhs)}
        </span>
      </div>
    </div>
  );
}