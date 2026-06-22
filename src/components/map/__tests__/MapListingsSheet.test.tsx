import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MapListingsSheet } from "../MapListingsSheet";

describe("MapListingsSheet", () => {
  it("renders collapsed peek without listing content", () => {
    const html = renderToStaticMarkup(
      <MapListingsSheet
        snap="collapsed"
        onSnapChange={vi.fn()}
        title="12 listings"
        subtitle="In map view"
      >
        <p>Listing panel</p>
      </MapListingsSheet>,
    );

    expect(html).toContain('data-testid="map-listings-sheet"');
    expect(html).toContain("12 listings");
    expect(html).not.toContain("Listing panel");
    expect(html).toContain('aria-expanded="false"');
  });

  it("renders expanded sheet with children", () => {
    const html = renderToStaticMarkup(
      <MapListingsSheet
        snap="half"
        onSnapChange={vi.fn()}
        title="12 listings"
        subtitle="In Bhopal"
      >
        <p>Listing panel</p>
      </MapListingsSheet>,
    );

    expect(html).toContain("Listing panel");
    expect(html).toContain('aria-expanded="true"');
  });
});