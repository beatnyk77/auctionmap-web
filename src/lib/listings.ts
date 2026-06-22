import { createServerSupabase } from "./supabase/server";
import { getActiveTenant, mergeTenantFilters } from "./tenant";
import type { Bbox, ListingDetail, ListingFilters, ListingPublic } from "./types";

const DEFAULT_BBOX: Bbox = {
  minLng: 68,
  minLat: 8,
  maxLng: 97,
  maxLat: 35,
};

export async function fetchListingsInBbox(
  bbox: Bbox = DEFAULT_BBOX,
  filters: ListingFilters = {},
  limit = 500,
): Promise<ListingPublic[]> {
  const tenant = await getActiveTenant();
  const mergedFilters = mergeTenantFilters(filters, tenant);
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc("listings_in_bbox", {
    min_lng: bbox.minLng,
    min_lat: bbox.minLat,
    max_lng: bbox.maxLng,
    max_lat: bbox.maxLat,
    filter_state: mergedFilters.state ?? null,
    filter_type: mergedFilters.propertyType ?? null,
    filter_auction_type: mergedFilters.auctionType ?? null,
    filter_risk: mergedFilters.riskTier ?? null,
    filter_min_price: mergedFilters.minPrice ?? null,
    filter_max_price: mergedFilters.maxPrice ?? null,
    filter_min_auction_date: mergedFilters.minAuctionDate ?? null,
    filter_max_auction_date: mergedFilters.maxAuctionDate ?? null,
    row_limit: limit,
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as ListingPublic[];
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