"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { buildListingsQuery } from "@/lib/filters";
import type { ListingFilters } from "@/lib/types";

interface ExportButtonProps {
  filters: ListingFilters;
  isAuthenticated: boolean;
  isPro: boolean;
}

export function ExportButton({
  filters,
  isAuthenticated,
  isPro,
}: ExportButtonProps) {
  const query = buildListingsQuery(filters);

  if (!isAuthenticated) {
    return (
      <Link
        href="/login?redirect=/search"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Download className="h-4 w-4" aria-hidden />
        Sign in to export
      </Link>
    );
  }

  if (!isPro) {
    return (
      <Link
        href="/pricing"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Download className="h-4 w-4" aria-hidden />
        Pro export
      </Link>
    );
  }

  return (
    <a
      href={`/api/export?${query}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <Download className="h-4 w-4" aria-hidden />
      Export CSV
    </a>
  );
}