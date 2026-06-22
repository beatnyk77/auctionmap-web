import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MapShareButton } from "../MapShareButton";

describe("MapShareButton", () => {
  it("renders share control", () => {
    const html = renderToStaticMarkup(
      <MapShareButton
        pathname="/"
        getState={vi.fn(() => ({
          filters: {},
          bbox: null,
          center: null,
          zoom: null,
          activeId: null,
        }))}
        className="share-btn"
      />,
    );

    expect(html).toContain('data-testid="map-share-button"');
    expect(html).toContain("Share map");
    expect(html).toContain('aria-label="Copy map link"');
  });
});