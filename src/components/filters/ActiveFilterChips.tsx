"use client";

import { X } from "lucide-react";
import {
  clearAllFilterChips,
  getActiveFilterChips,
  removeFilterChip,
} from "@/lib/filter-chips";
import type { ListingFilters } from "@/lib/types";

interface ActiveFilterChipsProps {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
}

export function ActiveFilterChips({ filters, onChange }: ActiveFilterChipsProps) {
  const chips = getActiveFilterChips(filters);
  if (chips.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      data-testid="active-filter-chips"
      role="list"
      aria-label="Active filters"
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          role="listitem"
          onClick={() => onChange(removeFilterChip(filters, chip.key))}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
          aria-label={`Remove ${chip.label} filter`}
        >
          <span>{chip.label}</span>
          <X className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(clearAllFilterChips(filters))}
        className="px-1 text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}