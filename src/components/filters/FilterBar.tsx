"use client";

import type { ListingFilters, RiskTier } from "@/lib/types";

const STATES = [
  "Madhya Pradesh",
  "Maharashtra",
  "Delhi/NCR",
  "Goa",
  "Gujarat",
  "Karnataka",
  "Rajasthan",
  "Uttar Pradesh",
];

const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Agricultural",
  "Plot/Land",
];

const RISK_TIERS: RiskTier[] = ["Green", "Amber", "Red", "Unscored"];

interface FilterBarProps {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  compact?: boolean;
}

export function FilterBar({ filters, onChange, compact }: FilterBarProps) {
  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

  return (
    <div
      className={`flex flex-wrap gap-2 ${compact ? "" : "rounded-xl border border-slate-200 bg-white p-3"}`}
    >
      <select
        aria-label="Filter by state"
        className={selectClass}
        value={filters.state ?? ""}
        onChange={(e) => onChange({ ...filters, state: e.target.value || undefined })}
      >
        <option value="">All states</option>
        {STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by property type"
        className={selectClass}
        value={filters.propertyType ?? ""}
        onChange={(e) =>
          onChange({ ...filters, propertyType: e.target.value || undefined })
        }
      >
        <option value="">All types</option>
        {PROPERTY_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by risk tier"
        className={selectClass}
        value={filters.riskTier ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            riskTier: (e.target.value as RiskTier) || undefined,
          })
        }
      >
        <option value="">All risk</option>
        {RISK_TIERS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <input
        aria-label="Minimum reserve price in lakhs"
        type="number"
        placeholder="Min ₹L"
        className={`${selectClass} w-24`}
        value={filters.minPrice ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            minPrice: e.target.value ? Number(e.target.value) : undefined,
          })
        }
      />

      <input
        aria-label="Maximum reserve price in lakhs"
        type="number"
        placeholder="Max ₹L"
        className={`${selectClass} w-24`}
        value={filters.maxPrice ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            maxPrice: e.target.value ? Number(e.target.value) : undefined,
          })
        }
      />
    </div>
  );
}