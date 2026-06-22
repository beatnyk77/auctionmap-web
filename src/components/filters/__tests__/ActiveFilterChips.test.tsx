import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ActiveFilterChips } from "../ActiveFilterChips";

describe("ActiveFilterChips", () => {
  it("renders nothing when no filters are active", () => {
    const html = renderToStaticMarkup(
      <ActiveFilterChips filters={{}} onChange={vi.fn()} />,
    );
    expect(html).toBe("");
  });

  it("renders removable chips and clear all", () => {
    const html = renderToStaticMarkup(
      <ActiveFilterChips
        filters={{ city: "Bhopal", riskTier: "Green" }}
        onChange={vi.fn()}
      />,
    );
    expect(html).toContain('data-testid="active-filter-chips"');
    expect(html).toContain("City: Bhopal");
    expect(html).toContain("Risk: Green");
    expect(html).toContain("Clear all");
    expect(html).toContain('aria-label="Remove City: Bhopal filter"');
  });
});