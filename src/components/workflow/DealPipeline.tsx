"use client";

import { useState } from "react";
import Link from "next/link";
import { GripVertical, Loader2, Trash2 } from "lucide-react";
import {
  PIPELINE_STAGES,
  type PipelineDealWithListing,
  type PipelineStage,
} from "@/lib/workflow-types";
import { RiskBadge } from "@/components/listings/RiskBadge";
import { formatDate, formatLakhs } from "@/lib/utils";

interface DealPipelineProps {
  initialDeals: PipelineDealWithListing[];
}

export function DealPipeline({ initialDeals }: DealPipelineProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateStage(dealId: string, stage: PipelineStage) {
    setBusyId(dealId);
    try {
      const res = await fetch(`/api/workflow/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) return;
      const json = await res.json();
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, ...json.deal } : d)),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function removeDeal(dealId: string) {
    setBusyId(dealId);
    try {
      const res = await fetch(`/api/workflow/deals/${dealId}`, { method: "DELETE" });
      if (!res.ok) return;
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
    } finally {
      setBusyId(null);
    }
  }

  const byStage = Object.fromEntries(
    PIPELINE_STAGES.map((s) => [s.id, deals.filter((d) => d.stage === s.id)]),
  ) as Record<PipelineStage, PipelineDealWithListing[]>;

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {PIPELINE_STAGES.map((stage) => (
        <div
          key={stage.id}
          className="flex min-h-[320px] flex-col rounded-xl border border-slate-200 bg-slate-50/50"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
            <h2 className="text-sm font-semibold text-slate-800">{stage.label}</h2>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
              {byStage[stage.id].length}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-2">
            {byStage[stage.id].length === 0 && (
              <p className="px-2 py-6 text-center text-xs text-slate-400">No deals</p>
            )}
            {byStage[stage.id].map((deal) => (
              <div
                key={deal.id}
                className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
              >
                {deal.listing ? (
                  <>
                    <Link
                      href={`/property/${deal.property_id}`}
                      className="text-sm font-medium text-slate-900 hover:underline"
                    >
                      {deal.listing.display_name}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {[deal.listing.city, deal.listing.state].filter(Boolean).join(", ")}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-slate-700">
                        {formatLakhs(deal.listing.reserve_price_lakhs)}
                      </span>
                      <RiskBadge tier={deal.listing.risk_tier} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Auction {formatDate(deal.listing.auction_date)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Property no longer public</p>
                )}

                <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-2">
                  <GripVertical className="h-3.5 w-3.5 text-slate-300" aria-hidden />
                  <select
                    value={deal.stage}
                    disabled={busyId === deal.id}
                    onChange={(e) =>
                      updateStage(deal.id, e.target.value as PipelineStage)
                    }
                    className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                    aria-label="Move deal stage"
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busyId === deal.id}
                    onClick={() => removeDeal(deal.id)}
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove from pipeline"
                  >
                    {busyId === deal.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}