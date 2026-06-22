import { describe, expect, it } from "vitest";
import { parseMapUrlState, serializeMapUrlState } from "../url-state";

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
});