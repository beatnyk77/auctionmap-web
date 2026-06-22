"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, LayoutGrid, List } from "lucide-react";
import { FilterBar } from "@/components/filters/FilterBar";
import { ListingCard } from "@/components/listings/ListingCard";
import { buildListingsQuery } from "@/lib/filters";
import type { ListingFilters, ListingPublic } from "@/lib/types";
import { formatDate, formatLakhs, formatSqftRate, cn } from "@/lib/utils";
import Link from "next/link";
import { RiskBadge } from "@/components/listings/RiskBadge";

interface SearchExplorerProps {
  initialListings: ListingPublic[];
}

export function SearchExplorer({ initialListings }: SearchExplorerProps) {
  const [listings, setListings] = useState(initialListings);
  const [filters, setFilters] = useState<ListingFilters>({});
  const [view, setView] = useState<"cards" | "table">("cards");
  const [loading, setLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings?${buildListingsQuery(filters)}`);
      const json = await res.json();
      setListings(json.listings ?? []);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchListings, 250);
    return () => clearTimeout(timer);
  }, [filters, fetchListings]);

  const sorted = [...listings].sort((a, b) => {
    const da = a.auction_date ?? "";
    const db = b.auction_date ?? "";
    return db.localeCompare(da);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Search listings</h1>
          <p className="mt-1 text-sm text-slate-500">
            {sorted.length} bank auction properties with coordinates
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            aria-label="Card view"
            onClick={() => setView("cards")}
            className={cn(
              "rounded-md p-2",
              view === "cards" ? "bg-slate-900 text-white" : "text-slate-600",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Table view"
            onClick={() => setView("table")}
            className={cn(
              "rounded-md p-2",
              view === "table" ? "bg-slate-900 text-white" : "text-slate-600",
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {loading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      )}

      {view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((l) => (
            <ListingCard key={l.property_id} listing={l} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Reserve</th>
                <th className="px-4 py-3">Auction</th>
                <th className="px-4 py-3">Risk</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((l) => (
                <tr key={l.property_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/property/${l.property_id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {l.display_name}
                    </Link>
                    <p className="text-xs text-slate-500">{l.property_type}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {[l.city, l.state].filter(Boolean).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <p>{formatLakhs(l.reserve_price_lakhs)}</p>
                    <p className="text-xs text-slate-500">{formatSqftRate(l.price_per_sqft)}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(l.auction_date)}</td>
                  <td className="px-4 py-3">
                    <RiskBadge tier={l.risk_tier} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && sorted.length === 0 && (
        <p className="py-16 text-center text-slate-500">No listings match your filters.</p>
      )}
    </div>
  );
}