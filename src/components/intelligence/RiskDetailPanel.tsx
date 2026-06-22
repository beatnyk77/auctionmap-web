"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { RiskBadge } from "@/components/listings/RiskBadge";
import { cn } from "@/lib/utils";
import type { RiskReason } from "@/lib/intelligence";
import type { RiskTier } from "@/lib/types";

const SEVERITY_ICON = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
};

const SEVERITY_STYLE = {
  info: "text-slate-600 bg-slate-50 border-slate-200",
  warning: "text-amber-900 bg-amber-50 border-amber-200",
  critical: "text-red-900 bg-red-50 border-red-200",
};

export function RiskDetailPanel({
  tier,
  reasons,
  completenessScore,
}: {
  tier: RiskTier | null | undefined;
  reasons: RiskReason[];
  completenessScore?: number | null;
}) {
  const [open, setOpen] = useState(tier === "Amber" || tier === "Red");

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">Why this risk tier?</span>
          <RiskBadge tier={tier} />
          {completenessScore != null && (
            <span className="text-xs text-slate-500">
              {Math.round(completenessScore * 100)}% complete
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
        )}
      </button>

      {open && (
        <ul className="space-y-2 border-t border-slate-100 px-4 py-3">
          {reasons.map((r) => {
            const Icon = SEVERITY_ICON[r.severity];
            return (
              <li
                key={r.label}
                className={cn(
                  "flex gap-3 rounded-lg border px-3 py-2 text-sm",
                  SEVERITY_STYLE[r.severity],
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  <p className="font-medium">{r.label}</p>
                  <p className="mt-0.5 opacity-90">{r.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}