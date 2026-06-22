import { NextRequest, NextResponse } from "next/server";
import { fetchListingsInBbox } from "@/lib/listings";
import type { Bbox, ListingFilters, RiskTier } from "@/lib/types";

function parseBbox(raw: string | null): Bbox | null {
  if (!raw) return null;
  const parts = raw.split(",").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;
  const [minLng, minLat, maxLng, maxLat] = parts;
  return { minLng, minLat, maxLng, maxLat };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const bbox = parseBbox(searchParams.get("bbox"));

    const filters: ListingFilters = {
      state: searchParams.get("state") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      propertyType: searchParams.get("type") ?? undefined,
      auctionType: searchParams.get("auction_type") ?? undefined,
      riskTier: (searchParams.get("risk") as RiskTier) ?? undefined,
      minPrice: searchParams.get("min_price")
        ? Number(searchParams.get("min_price"))
        : undefined,
      maxPrice: searchParams.get("max_price")
        ? Number(searchParams.get("max_price"))
        : undefined,
      minAuctionDate: searchParams.get("min_auction_date") ?? undefined,
      maxAuctionDate: searchParams.get("max_auction_date") ?? undefined,
    };

    const limit = Math.min(
      2000,
      Math.max(1, Number(searchParams.get("limit") ?? 500)),
    );

    const listings = await fetchListingsInBbox(bbox ?? undefined, filters, limit);

    return NextResponse.json({
      count: listings.length,
      listings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}