import { createServerSupabase } from "./supabase/server";
import type { Bbox, ListingDetail, ListingFilters, ListingPublic } from "./types";

const DEFAULT_BBOX: Bbox = {
  minLng: 68,
  minLat: 8,
  maxLng: 97,
  maxLat: 35,
};

function applyClientFilters(
  listings: ListingPublic[],
  filters: ListingFilters,
): ListingPublic[] {
  return listings.filter((l) => {
    if (filters.riskTier && l.risk_tier !== filters.riskTier) return false;
    if (filters.auctionType && l.auction_type !== filters.auctionType) return false;
    if (filters.minPrice != null && (l.reserve_price_lakhs ?? 0) < filters.minPrice)
      return false;
    if (filters.maxPrice != null && (l.reserve_price_lakhs ?? Infinity) > filters.maxPrice)
      return false;
    if (filters.minAuctionDate && (l.auction_date ?? "") < filters.minAuctionDate)
      return false;
    if (filters.maxAuctionDate && (l.auction_date ?? "9999") > filters.maxAuctionDate)
      return false;
    return true;
  });
}

export async function fetchListingsInBbox(
  bbox: Bbox = DEFAULT_BBOX,
  filters: ListingFilters = {},
  limit = 500,
): Promise<ListingPublic[]> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc("listings_in_bbox", {
    min_lng: bbox.minLng,
    min_lat: bbox.minLat,
    max_lng: bbox.maxLng,
    max_lat: bbox.maxLat,
    filter_state: filters.state ?? null,
    filter_type: filters.propertyType ?? null,
    row_limit: limit,
  });

  if (error) throw new Error(error.message);
  return applyClientFilters((data ?? []) as ListingPublic[], filters);
}

export async function fetchListingDetail(
  propertyId: string,
): Promise<ListingDetail | null> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("listing_detail_public")
    .select("*")
    .eq("property_id", propertyId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ListingDetail | null;
}

export async function fetchAllListings(
  filters: ListingFilters = {},
  limit = 500,
): Promise<ListingPublic[]> {
  return fetchListingsInBbox(DEFAULT_BBOX, filters, limit);
}