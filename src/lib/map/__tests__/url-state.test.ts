import { describe, expect, it } from "vitest";
import {
  buildListingMapHref,
  buildMapShareUrl,
  LISTING_MAP_ZOOM,
  parseMapUrlState,
  serializeMapUrlState,
} from "../url-state";

describe("map url state", () => {
  it("round-trips filters and bbox", () => {
    const params = new URLSearchParams(
      "state=Madhya Pradesh&city=Bhopal&risk=Green&bbox=72.8,18.4,73.0,18.6&listing=abc",
    );
    const parsed = parseMapUrlState(params);
    expect(parsed.filters.state).toBe("Madhya Pradesh");
    expect(parsed.filters.city).toBe("Bhopal");
    expect(parsed.filters.riskTier).toBe("Green");
    expect(parsed.bbox?.minLng).toBeCloseTo(72.8);
    expect(parsed.activeId).toBe("abc");

    const serialized = serializeMapUrlState(parsed);
    expect(serialized).toContain("state=Madhya+Pradesh");
    expect(serialized).toContain("city=Bhopal");
    expect(serialized).toContain("risk=Green");
    expect(serialized).toContain("listing=abc");
  });

  it("builds property deep link with listing, coords, and city filter", () => {
    const href = buildListingMapHref({
      propertyId: "prop-99",
      lon: 77.4126,
      lat: 23.2599,
      city: "Bhopal",
      state: "Madhya Pradesh",
    });

    expect(href).toMatch(/^\/\?/);
    const parsed = parseMapUrlState(new URLSearchParams(href.slice(2)));
    expect(parsed.activeId).toBe("prop-99");
    expect(parsed.filters.city).toBe("Bhopal");
    expect(parsed.filters.state).toBe("Madhya Pradesh");
    expect(parsed.center?.[0]).toBeCloseTo(77.4126);
    expect(parsed.center?.[1]).toBeCloseTo(23.2599);
    expect(parsed.zoom).toBe(LISTING_MAP_ZOOM);
  });

  it("builds listing-only deep link when coordinates are missing", () => {
    const href = buildListingMapHref({
      propertyId: "prop-orphan",
      city: "Indore",
    });

    const parsed = parseMapUrlState(new URLSearchParams(href.slice(2)));
    expect(parsed.activeId).toBe("prop-orphan");
    expect(parsed.filters.city).toBe("Indore");
    expect(parsed.center).toBeNull();
    expect(parsed.zoom).toBeNull();
  });

  it("builds absolute share URL with viewport and filters", () => {
    const url = buildMapShareUrl("https://auctionmap.in", "/", {
      filters: { city: "Bhopal", riskTier: "Green" },
      bbox: { minLng: 77.3, minLat: 23.2, maxLng: 77.5, maxLat: 23.3 },
      center: [77.41, 23.26],
      zoom: 12,
      activeId: "prop-1",
    });

    expect(url).toMatch(/^https:\/\/auctionmap\.in\/\?/);
    const parsed = parseMapUrlState(new URL(url).searchParams);
    expect(parsed.filters.city).toBe("Bhopal");
    expect(parsed.filters.riskTier).toBe("Green");
    expect(parsed.activeId).toBe("prop-1");
    expect(parsed.zoom).toBe(12);
  });
});