import { NextRequest, NextResponse } from "next/server";
import { subscribeAlert } from "@/lib/intelligence";
import type { ListingFilters } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim();
    const filters = (body.filters ?? {}) as ListingFilters;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const filterPayload: Record<string, unknown> = {};
    if (filters.state) filterPayload.state = filters.state;
    if (filters.propertyType) filterPayload.property_type = filters.propertyType;
    if (filters.riskTier) filterPayload.risk_tier = filters.riskTier;
    if (filters.minPrice != null) filterPayload.min_price = filters.minPrice;
    if (filters.maxPrice != null) filterPayload.max_price = filters.maxPrice;

    const id = await subscribeAlert(email, filterPayload);
    return NextResponse.json({ id, subscribed: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}