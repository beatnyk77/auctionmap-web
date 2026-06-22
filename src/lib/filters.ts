import type { Bbox, ListingFilters } from "./types";

export function buildListingsQuery(
  filters: ListingFilters,
  bbox?: Bbox | null,
): string {
  const params = new URLSearchParams();
  if (bbox) {
    params.set(
      "bbox",
      [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat].join(","),
    );
  }
  if (filters.state) params.set("state", filters.state);
  if (filters.city) params.set("city", filters.city);
  if (filters.propertyType) params.set("type", filters.propertyType);
  if (filters.auctionType) params.set("auction_type", filters.auctionType);
  if (filters.riskTier) params.set("risk", filters.riskTier);
  if (filters.minPrice != null) params.set("min_price", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("max_price", String(filters.maxPrice));
  if (filters.minAuctionDate) params.set("min_auction_date", filters.minAuctionDate);
  if (filters.maxAuctionDate) params.set("max_auction_date", filters.maxAuctionDate);
  return params.toString();
}