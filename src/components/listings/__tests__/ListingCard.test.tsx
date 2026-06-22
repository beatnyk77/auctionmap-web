import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ListingPublic } from "@/lib/types";
import { ListingCard, listingDetailHref } from "../ListingCard";

const mockListing: ListingPublic = {
  property_id: "prop-123",
  event_id: "evt-1",
  display_name: "2BHK Flat, Arera Colony",
  property_type: "Flat",
  city: "Bhopal",
  state: "Madhya Pradesh",
  locality: "Arera Colony",
  area_sqft: 950,
  bank_name: "SBI",
  risk_tier_current: "Green",
  lat: 23.22,
  lon: 77.43,
  reserve_price_lakhs: 42.5,
  emd_lakhs: 4.25,
  auction_date: "2026-07-15",
  auction_type: "e-Auction",
  possession_status: null,
  encumbrance_status: null,
  risk_tier: "Green",
  price_per_sqft: 4473,
  circle_rate_per_sqft: null,
  tags: null,
  source_url: "https://example.com",
  source_code: "baanknet",
  scraped_at: "2026-06-20T00:00:00Z",
};

describe("listingDetailHref", () => {
  it("builds property detail path", () => {
    expect(listingDetailHref("abc")).toBe("/property/abc");
  });
});

describe("ListingCard", () => {
  it("renders entire card as a link on search pages", () => {
    const html = renderToStaticMarkup(<ListingCard listing={mockListing} />);
    expect(html).toContain('data-testid="listing-card-link"');
    expect(html).toContain('href="/property/prop-123"');
    expect(html).not.toContain("View details");
    expect(html).not.toContain('data-testid="listing-card-preview"');
  });

  it("renders preview mode with select button and separate details link on map", () => {
    const html = renderToStaticMarkup(
      <ListingCard listing={mockListing} onSelect={vi.fn()} active />,
    );
    expect(html).toContain('data-testid="listing-card-preview"');
    expect(html).toContain("<button");
    expect(html).toContain('href="/property/prop-123"');
    expect(html).toContain("View details");
    expect(html).not.toContain('data-testid="listing-card-link"');
  });
});