import { formatDate, formatLakhs } from "@/lib/utils";
import type { ListingFilters } from "@/lib/types";

export type FilterChipKey =
  | "state"
  | "city"
  | "propertyType"
  | "auctionType"
  | "riskTier"
  | "minPrice"
  | "maxPrice"
  | "minAuctionDate"
  | "maxAuctionDate";

export interface FilterChip {
  key: FilterChipKey;
  label: string;
}

export function getActiveFilterChips(filters: ListingFilters): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.state) {
    chips.push({ key: "state", label: `State: ${filters.state}` });
  }
  if (filters.city) {
    chips.push({ key: "city", label: `City: ${filters.city}` });
  }
  if (filters.propertyType) {
    chips.push({ key: "propertyType", label: `Type: ${filters.propertyType}` });
  }
  if (filters.auctionType) {
    chips.push({ key: "auctionType", label: `Auction: ${filters.auctionType}` });
  }
  if (filters.riskTier) {
    chips.push({ key: "riskTier", label: `Risk: ${filters.riskTier}` });
  }
  if (filters.minPrice != null) {
    chips.push({ key: "minPrice", label: `Min ${formatLakhs(filters.minPrice)}` });
  }
  if (filters.maxPrice != null) {
    chips.push({ key: "maxPrice", label: `Max ${formatLakhs(filters.maxPrice)}` });
  }
  if (filters.minAuctionDate) {
    chips.push({
      key: "minAuctionDate",
      label: `From ${formatDate(filters.minAuctionDate)}`,
    });
  }
  if (filters.maxAuctionDate) {
    chips.push({
      key: "maxAuctionDate",
      label: `To ${formatDate(filters.maxAuctionDate)}`,
    });
  }

  return chips;
}

export function removeFilterChip(
  filters: ListingFilters,
  key: FilterChipKey,
): ListingFilters {
  switch (key) {
    case "state":
      return { ...filters, state: undefined, city: undefined };
    case "city":
      return { ...filters, city: undefined };
    case "propertyType":
      return { ...filters, propertyType: undefined };
    case "auctionType":
      return { ...filters, auctionType: undefined };
    case "riskTier":
      return { ...filters, riskTier: undefined };
    case "minPrice":
      return { ...filters, minPrice: undefined };
    case "maxPrice":
      return { ...filters, maxPrice: undefined };
    case "minAuctionDate":
      return { ...filters, minAuctionDate: undefined };
    case "maxAuctionDate":
      return { ...filters, maxAuctionDate: undefined };
  }
}

export function clearAllFilterChips(filters: ListingFilters): ListingFilters {
  return {
    ...filters,
    state: undefined,
    city: undefined,
    propertyType: undefined,
    auctionType: undefined,
    riskTier: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minAuctionDate: undefined,
    maxAuctionDate: undefined,
  };
}

export function hasActiveFilterChips(filters: ListingFilters): boolean {
  return getActiveFilterChips(filters).length > 0;
}