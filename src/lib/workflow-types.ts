import type { ListingFilters, ListingPublic } from "./types";

export type PipelineStage = "shortlist" | "dd" | "bid" | "won" | "lost";

export const PIPELINE_STAGES: { id: PipelineStage; label: string }[] = [
  { id: "shortlist", label: "Shortlist" },
  { id: "dd", label: "Due diligence" },
  { id: "bid", label: "Bid" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

export interface SavedSearch {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  filters: ListingFilters;
  created_at: string;
  updated_at: string;
}

export interface PipelineDeal {
  id: string;
  user_id: string;
  organization_id: string | null;
  property_id: string;
  stage: PipelineStage;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPropertyNote {
  id: string;
  user_id: string;
  property_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineDealWithListing extends PipelineDeal {
  listing: ListingPublic | null;
}

export function filtersToSearchParams(filters: ListingFilters): string {
  const params = new URLSearchParams();
  if (filters.state) params.set("state", filters.state);
  if (filters.propertyType) params.set("type", filters.propertyType);
  if (filters.auctionType) params.set("auction_type", filters.auctionType);
  if (filters.riskTier) params.set("risk", filters.riskTier);
  if (filters.minPrice != null) params.set("min_price", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("max_price", String(filters.maxPrice));
  if (filters.minAuctionDate) params.set("min_auction_date", filters.minAuctionDate);
  if (filters.maxAuctionDate) params.set("max_auction_date", filters.maxAuctionDate);
  return params.toString();
}

export function describeFilters(filters: ListingFilters): string {
  const parts: string[] = [];
  if (filters.state) parts.push(filters.state);
  if (filters.propertyType) parts.push(filters.propertyType);
  if (filters.auctionType) parts.push(filters.auctionType);
  if (filters.riskTier) parts.push(`${filters.riskTier} risk`);
  if (filters.minPrice != null || filters.maxPrice != null) {
    parts.push(
      `₹${filters.minPrice ?? 0}–${filters.maxPrice ?? "∞"}L reserve`,
    );
  }
  return parts.length > 0 ? parts.join(" · ") : "All listings";
}