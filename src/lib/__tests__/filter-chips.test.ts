import { describe, expect, it } from "vitest";
import {
  clearAllFilterChips,
  getActiveFilterChips,
  hasActiveFilterChips,
  removeFilterChip,
} from "../filter-chips";
import type { ListingFilters } from "../types";

const sampleFilters: ListingFilters = {
  state: "Madhya Pradesh",
  city: "Bhopal",
  propertyType: "Residential",
  riskTier: "Green",
  minPrice: 25,
  maxAuctionDate: "2026-12-31",
};

describe("filter chips", () => {
  it("lists chips for set filters", () => {
    const chips = getActiveFilterChips(sampleFilters);
    expect(chips.map((c) => c.key)).toEqual([
      "state",
      "city",
      "propertyType",
      "riskTier",
      "minPrice",
      "maxAuctionDate",
    ]);
    expect(chips.find((c) => c.key === "city")?.label).toBe("City: Bhopal");
  });

  it("removes a single chip", () => {
    const next = removeFilterChip(sampleFilters, "riskTier");
    expect(next.riskTier).toBeUndefined();
    expect(next.city).toBe("Bhopal");
  });

  it("clears city when state chip is removed", () => {
    const next = removeFilterChip(sampleFilters, "state");
    expect(next.state).toBeUndefined();
    expect(next.city).toBeUndefined();
    expect(next.propertyType).toBe("Residential");
  });

  it("clears all filter fields while preserving bbox", () => {
    const withBbox: ListingFilters = {
      ...sampleFilters,
      bbox: { minLng: 1, minLat: 2, maxLng: 3, maxLat: 4 },
    };
    const next = clearAllFilterChips(withBbox);
    expect(hasActiveFilterChips(next)).toBe(false);
    expect(next.bbox).toEqual(withBbox.bbox);
  });
});