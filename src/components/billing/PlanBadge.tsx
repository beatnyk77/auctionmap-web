import Link from "next/link";
import type { PlanTier } from "@/lib/plans";

const LABELS: Record<PlanTier, string> = {
  free: "Free",
  pro: "Pro",
  white_label: "White-label",
};

const STYLES: Record<PlanTier, string> = {
  free: "bg-slate-100 text-slate-600",
  pro: "bg-blue-100 text-blue-800",
  white_label: "bg-violet-100 text-violet-800",
};

export function PlanBadge({ plan }: { plan: PlanTier }) {
  return (
    <Link
      href="/pricing"
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-opacity hover:opacity-80 ${STYLES[plan]}`}
    >
      {LABELS[plan]}
    </Link>
  );
}