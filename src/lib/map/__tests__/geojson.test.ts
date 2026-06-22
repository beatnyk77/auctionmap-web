import { describe, expect, it } from "vitest";
import { listingsBbox, toGeoJson } from "../geojson";
import type { ListingPublic } from "@/lib/types";

const sample: ListingPublic[] = [
  {
    property_id: "a",
    event_id: "e1",
    display_name: "Test Flat",
    property_type: "Residential",
    city: "Pune",
    state: "Maharashtra",
    locality: null,
    area_sqft: 900,
    bank_name: "SBI",
    risk_tier_current: "Green",
    lat: 18.52,
    lon: 73.85,
    reserve_price_lakhs: 45,
    emd_lakhs: 4.5,
    auction_date: "2026-07-01",
    auction_type: "SARFAESI",
    possession_status: null,
    encumbrance_status: null,
    risk_tier: "Green",
    price_per_sqft: 5000,
    circle_rate_per_sqft: null,
    tags: null,
    source_url: "https://example.com",
    source_code: "x",
    scraped_at: "2026-06-01",
  },
];

describe("toGeoJson", () => {
  it("maps listings to colored point features", () => {
    const fc = toGeoJson(sample, "a");
    expect(fc.features).toHaveLength(1);
    expect(fc.features[0].properties?.color).toBe("#16a34a");
    expect(fc.features[0].properties?.active).toBe(1);
  });
});

describe("listingsBbox", () => {
  it("returns padded bounds for points", () => {
    const bbox = listingsBbox(sample);
    expect(bbox).not.toBeNull();
    expect(bbox!.minLng).toBeLessThan(73.85);
    expect(bbox!.maxLat).toBeGreaterThan(18.52);
  });
});