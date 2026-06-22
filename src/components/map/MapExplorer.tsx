"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { MapView } from "./MapView";
import { ListingCard } from "@/components/listings/ListingCard";
import { FilterBar } from "@/components/filters/FilterBar";
import type { Bbox, ListingFilters, ListingPublic } from "@/lib/types";

function buildQuery(bbox: Bbox | null, filters: ListingFilters): string {
  const params = new URLSearchParams();
  if (bbox) {
    params.set(
      "bbox",
      [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat].join(","),
    );
  }
  if (filters.state) params.set("state", filters.state);
  if (filters.propertyType) params.set("type", filters.propertyType);
  if (filters.riskTier) params.set("risk", filters.riskTier);
  if (filters.minPrice != null) params.set("min_price", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("max_price", String(filters.maxPrice));
  return params.toString();
}

interface MapExplorerProps {
  initialListings: ListingPublic[];
}

export function MapExplorer({ initialListings }: MapExplorerProps) {
  const [listings, setListings] = useState(initialListings);
  const [filters, setFilters] = useState<ListingFilters>({});
  const [bbox, setBbox] = useState<Bbox | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQuery(bbox, filters);
      const res = await fetch(`/api/listings?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load listings");
      setListings(json.listings ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, [bbox, filters]);

  useEffect(() => {
    if (!bbox) return;
    const timer = setTimeout(fetchListings, 300);
    return () => clearTimeout(timer);
  }, [bbox, filters, fetchListings]);

  const sorted = useMemo(
    () =>
      [...listings].sort((a, b) => {
        const da = a.auction_date ?? "";
        const db = b.auction_date ?? "";
        return db.localeCompare(da);
      }),
    [listings],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="relative min-h-[45vh] flex-1 lg:min-h-0">
        <MapView
          listings={listings}
          activeId={activeId}
          onBboxChange={setBbox}
          onMarkerClick={(l) => setActiveId(l.property_id)}
        />
        {loading && (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Updating…
          </div>
        )}
      </div>

      <aside className="flex w-full flex-col border-t border-slate-200 bg-slate-50 lg:w-[380px] lg:border-l lg:border-t-0">
        <div className="border-b border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              {sorted.length} listings
            </h2>
            <p className="text-[11px] text-slate-500">Updated daily 6 AM IST</p>
          </div>
          <FilterBar filters={filters} onChange={setFilters} compact />
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {!error && sorted.length === 0 && !loading && (
            <p className="px-2 py-8 text-center text-sm text-slate-500">
              No map-ready listings in this area yet. Run the pipeline to populate data.
            </p>
          )}
          {sorted.map((listing) => (
            <ListingCard
              key={listing.property_id}
              listing={listing}
              active={listing.property_id === activeId}
              onHover={() => setActiveId(listing.property_id)}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}