import { riskColor } from "@/lib/utils";
import type { RiskTier } from "@/lib/types";

const TIERS: { tier: RiskTier; label: string }[] = [
  { tier: "Green", label: "Low risk" },
  { tier: "Amber", label: "Medium risk" },
  { tier: "Red", label: "High risk" },
  { tier: "Unscored", label: "Unscored" },
];

export function MapLegend() {
  return (
    <div
      className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-slate-200/80 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm"
      aria-label="Risk tier legend"
    >
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Risk tier
      </p>
      <ul className="space-y-1">
        {TIERS.map(({ tier, label }) => (
          <li key={tier} className="flex items-center gap-2 text-xs text-slate-700">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
              style={{ backgroundColor: riskColor(tier) }}
              aria-hidden
            />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}