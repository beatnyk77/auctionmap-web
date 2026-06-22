import { cn, riskBadgeClass } from "@/lib/utils";
import type { RiskTier } from "@/lib/types";

export function RiskBadge({ tier }: { tier: RiskTier | null | undefined }) {
  const label = tier ?? "Unscored";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        riskBadgeClass(tier),
      )}
    >
      {label}
    </span>
  );
}