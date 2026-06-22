import type { Bbox, ListingFilters, RiskTier } from "@/lib/types";

const RISK_TIERS = new Set<RiskTier>(["Green", "Amber", "Red", "Unscored"]);

export interface MapUrlState {
  filters: ListingFilters;
  bbox: Bbox | null;
  center: [number, number] | null;
  zoom: number | null;
  activeId: string | null;
}

function parseBbox(raw: string | null): Bbox | null {
  if (!raw) return null;
  const parts = raw.split(",").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;
  const [minLng, minLat, maxLng, maxLat] = parts;
  return { minLng, minLat, maxLng, maxLat };
}

export function parseMapUrlState(params: URLSearchParams): MapUrlState {
  const risk = params.get("risk");
  const filters: ListingFilters = {
    state: params.get("state") ?? undefined,
    city: params.get("city") ?? undefined,
    propertyType: params.get("type") ?? undefined,
    auctionType: params.get("auction_type") ?? undefined,
    riskTier: risk && RISK_TIERS.has(risk as RiskTier) ? (risk as RiskTier) : undefined,
    minPrice: params.get("min_price") ? Number(params.get("min_price")) : undefined,
    maxPrice: params.get("max_price") ? Number(params.get("max_price")) : undefined,
    minAuctionDate: params.get("min_auction_date") ?? undefined,
    maxAuctionDate: params.get("max_auction_date") ?? undefined,
  };

  const lng = params.get("lng");
  const lat = params.get("lat");
  const zoom = params.get("zoom");
  const center =
    lng != null && lat != null && !Number.isNaN(Number(lng)) && !Number.isNaN(Number(lat))
      ? ([Number(lng), Number(lat)] as [number, number])
      : null;

  return {
    filters,
    bbox: parseBbox(params.get("bbox")),
    center,
    zoom: zoom != null && !Number.isNaN(Number(zoom)) ? Number(zoom) : null,
    activeId: params.get("listing") ?? null,
  };
}

export function serializeMapUrlState(state: MapUrlState): string {
  const params = new URLSearchParams();
  const { filters, bbox, center, zoom, activeId } = state;

  if (filters.state) params.set("state", filters.state);
  if (filters.city) params.set("city", filters.city);
  if (filters.propertyType) params.set("type", filters.propertyType);
  if (filters.auctionType) params.set("auction_type", filters.auctionType);
  if (filters.riskTier) params.set("risk", filters.riskTier);
  if (filters.minPrice != null) params.set("min_price", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("max_price", String(filters.maxPrice));
  if (filters.minAuctionDate) params.set("min_auction_date", filters.minAuctionDate);
  if (filters.maxAuctionDate) params.set("max_auction_date", filters.maxAuctionDate);

  if (bbox) {
    params.set(
      "bbox",
      [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat]
        .map((n) => n.toFixed(5))
        .join(","),
    );
  }
  if (center) {
    params.set("lng", center[0].toFixed(5));
    params.set("lat", center[1].toFixed(5));
  }
  if (zoom != null) params.set("zoom", zoom.toFixed(2));
  if (activeId) params.set("listing", activeId);

  return params.toString();
}

/** Zoom used when opening the map focused on a single listing. */
export const LISTING_MAP_ZOOM = 14;

export interface ListingMapLinkInput {
  propertyId: string;
  lon?: number | null;
  lat?: number | null;
  city?: string | null;
  state?: string | null;
  zoom?: number;
}

function hasValidCoords(lon?: number | null, lat?: number | null): lon is number {
  return (
    lon != null &&
    lat != null &&
    !Number.isNaN(lon) &&
    !Number.isNaN(lat)
  );
}

/** Deep link from property detail back to map with pin selected. */
export function buildListingMapHref(input: ListingMapLinkInput): string {
  const coords = hasValidCoords(input.lon, input.lat)
    ? ([input.lon, input.lat] as [number, number])
    : null;

  const qs = serializeMapUrlState({
    filters: {
      city: input.city ?? undefined,
      state: input.state ?? undefined,
    },
    bbox: null,
    center: coords,
    zoom: coords ? (input.zoom ?? LISTING_MAP_ZOOM) : null,
    activeId: input.propertyId,
  });

  return qs ? `/?${qs}` : "/";
}

/** Absolute URL for sharing the current map view (filters, bbox, viewport, listing). */
export function buildMapShareUrl(
  origin: string,
  pathname: string,
  state: MapUrlState,
): string {
  const qs = serializeMapUrlState(state);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const base = origin.replace(/\/$/, "");
  return qs ? `${base}${path}?${qs}` : `${base}${path}`;
}

export function hasUrlFilters(params: URLSearchParams): boolean {
  const keys = [
    "state",
    "city",
    "type",
    "auction_type",
    "risk",
    "min_price",
    "max_price",
    "min_auction_date",
    "max_auction_date",
    "bbox",
    "lng",
    "lat",
    "zoom",
    "listing",
  ];
  return keys.some((k) => params.has(k));
}