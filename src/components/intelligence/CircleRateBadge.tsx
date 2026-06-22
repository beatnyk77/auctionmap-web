import { TrendingDown } from "lucide-react";

export function CircleRateBadge({ discountPct }: { discountPct: number }) {
  if (discountPct < 10) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
      <TrendingDown className="h-3.5 w-3.5" aria-hidden />
      {discountPct}% below circle rate
    </span>
  );
}