"use client";

import { useEffect, useState } from "react";
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
  "Tamil Nadu",
  "Telangana",
];

const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Agricultural",
  "Plot/Land",
];

const RISK_TIERS: RiskTier[] = ["Green", "Amber", "Red", "Unscored"];

const AUCTION_TYPES = ["SARFAESI", "DRT", "IBC/NCLT", "Other"];

interface CityOption {
  name: string;
  count: number;
}

interface FilterBarProps {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  compact?: boolean;
}

export function FilterBar({ filters, onChange, compact }: FilterBarProps) {
  const [cities, setCities] = useState<CityOption[]>([]);

  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.state) params.set("state", filters.state);

    fetch(`/api/cities?${params}`)
      .then((res) => res.json())
      .then((json) => setCities(json.cities ?? []))
      .catch(() => setCities([]));
  }, [filters.state]);

  const handleStateChange = (state: string | undefined) => {
    onChange({ ...filters, state, city: undefined });
  };

  return (
    <div
      className={`flex flex-wrap gap-2 ${compact ? "" : "rounded-xl border border-slate-200 bg-white p-3"}`}
    >
      <select
        aria-label="Filter by state"
        className={selectClass}
        value={filters.state ?? ""}
        onChange={(e) => handleStateChange(e.target.value || undefined)}
      >
        <option value="">All states</option>
        {STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by city"
        className={selectClass}
        value={filters.city ?? ""}
        onChange={(e) => onChange({ ...filters, city: e.target.value || undefined })}
        disabled={cities.length === 0 && !filters.city}
      >
        <option value="">All cities</option>
        {filters.city && !cities.some((c) => c.name === filters.city) && (
          <option value={filters.city}>{filters.city}</option>
        )}
        {cities.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name} ({c.count})
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
        aria-label="Filter by auction type"
        className={selectClass}
        value={filters.auctionType ?? ""}
        onChange={(e) =>
          onChange({ ...filters, auctionType: e.target.value || undefined })
        }
      >
        <option value="">All auction types</option>
        {AUCTION_TYPES.map((t) => (
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

      <input
        aria-label="Auction date from"
        type="date"
        className={selectClass}
        value={filters.minAuctionDate ?? ""}
        onChange={(e) =>
          onChange({ ...filters, minAuctionDate: e.target.value || undefined })
        }
      />

      <input
        aria-label="Auction date to"
        type="date"
        className={selectClass}
        value={filters.maxAuctionDate ?? ""}
        onChange={(e) =>
          onChange({ ...filters, maxAuctionDate: e.target.value || undefined })
        }
      />
    </div>
  );
}