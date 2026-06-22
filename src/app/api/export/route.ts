import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/workflow";
import { fetchAllListings } from "@/lib/listings";
import type { ListingFilters, RiskTier } from "@/lib/types";

function escapeCsv(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    await requireUser();

    const { searchParams } = request.nextUrl;
    const filters: ListingFilters = {
      state: searchParams.get("state") ?? undefined,
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

    const listings = await fetchAllListings(filters, 2000);

    const headers = [
      "property_id",
      "display_name",
      "property_type",
      "city",
      "state",
      "locality",
      "bank_name",
      "reserve_price_lakhs",
      "emd_lakhs",
      "auction_date",
      "auction_type",
      "risk_tier",
      "price_per_sqft",
      "area_sqft",
      "possession_status",
      "encumbrance_status",
      "source_url",
    ];

    const rows = listings.map((l) =>
      [
        l.property_id,
        l.display_name,
        l.property_type,
        l.city,
        l.state,
        l.locality,
        l.bank_name,
        l.reserve_price_lakhs,
        l.emd_lakhs,
        l.auction_date,
        l.auction_type,
        l.risk_tier,
        l.price_per_sqft,
        l.area_sqft,
        l.possession_status,
        l.encumbrance_status,
        l.source_url,
      ]
        .map(escapeCsv)
        .join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="auctionmap-export-${date}.csv"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}