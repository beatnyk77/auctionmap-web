"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";

interface AddToPipelineButtonProps {
  propertyId: string;
  isAuthenticated: boolean;
  initialInPipeline: boolean;
}

export function AddToPipelineButton({
  propertyId,
  isAuthenticated,
  initialInPipeline,
}: AddToPipelineButtonProps) {
  const [inPipeline, setInPipeline] = useState(initialInPipeline);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?redirect=/property/${propertyId}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <BookmarkPlus className="h-4 w-4" aria-hidden />
        Sign in to track
      </Link>
    );
  }

  async function toggle() {
    if (inPipeline) return;
    setLoading(true);
    try {
      const res = await fetch("/api/workflow/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: propertyId, stage: "shortlist" }),
      });
      if (res.ok) setInPipeline(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading || inPipeline}
      onClick={toggle}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : inPipeline ? (
        <Check className="h-4 w-4 text-emerald-600" aria-hidden />
      ) : (
        <BookmarkPlus className="h-4 w-4" aria-hidden />
      )}
      {inPipeline ? "In pipeline" : "Add to pipeline"}
    </button>
  );
}