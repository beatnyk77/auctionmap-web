import type { MutableRefObject } from "react";
import { ListingCard } from "@/components/listings/ListingCard";
import { FilterBar } from "@/components/filters/FilterBar";
import { SaveSearchButton } from "@/components/workflow/SaveSearchButton";
import type { ListingFilters, ListingPublic } from "@/lib/types";

interface MapListingsPanelProps {
  listings: ListingPublic[];
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  savedFilters: ListingFilters;
  isAuthenticated: boolean;
  listingCount: number;
  scopeSubtitle: string;
  loading: boolean;
  error: string | null;
  activeId: string | null;
  cardRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  onCardHover: (listing: ListingPublic) => void;
  onCardSelect: (listing: ListingPublic) => void;
}

export function MapListingsPanel({
  listings,
  filters,
  onFiltersChange,
  savedFilters,
  isAuthenticated,
  listingCount,
  scopeSubtitle,
  loading,
  error,
  activeId,
  cardRefs,
  onCardHover,
  onCardSelect,
}: MapListingsPanelProps) {
  return (
    <>
      <div className="shrink-0 border-b border-slate-200 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{listingCount} listings</h2>
            <p className="text-[11px] text-slate-500">{scopeSubtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <SaveSearchButton filters={savedFilters} isAuthenticated={isAuthenticated} />
            <p className="hidden text-[11px] text-slate-500 sm:block">Updated daily 6 AM IST</p>
          </div>
        </div>
        <FilterBar filters={filters} onChange={onFiltersChange} compact />
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {!error && listings.length === 0 && !loading && (
          <p className="px-2 py-8 text-center text-sm text-slate-500">
            No map-ready listings in this area yet. Pan the map or clear filters to see more.
          </p>
        )}
        {listings.map((listing) => (
          <div
            key={listing.property_id}
            ref={(el) => {
              cardRefs.current[listing.property_id] = el;
            }}
          >
            <ListingCard
              listing={listing}
              active={listing.property_id === activeId}
              onHover={() => onCardHover(listing)}
              onSelect={() => onCardSelect(listing)}
            />
          </div>
        ))}
      </div>
    </>
  );
}