import { describe, expect, it } from "vitest";
import {
  clampSheetHeight,
  nearestSheetSnap,
  nextSheetSnap,
  sheetHeightForSnap,
  SHEET_PEEK_HEIGHT_PX,
} from "../sheet-snap";

describe("sheet snap", () => {
  it("maps snap points to viewport-relative heights", () => {
    expect(sheetHeightForSnap("collapsed", 800)).toBe(SHEET_PEEK_HEIGHT_PX);
    expect(sheetHeightForSnap("half", 800)).toBe(400);
    expect(sheetHeightForSnap("full", 800)).toBe(704);
  });

  it("clamps drag height between peek and max", () => {
    expect(clampSheetHeight(10, 800)).toBe(SHEET_PEEK_HEIGHT_PX);
    expect(clampSheetHeight(900, 800)).toBe(736);
    expect(clampSheetHeight(420, 800)).toBe(420);
  });

  it("snaps to nearest preset height", () => {
    expect(nearestSheetSnap(80, 800)).toBe("collapsed");
    expect(nearestSheetSnap(390, 800)).toBe("half");
    expect(nearestSheetSnap(690, 800)).toBe("full");
  });

  it("cycles snap states on header tap", () => {
    expect(nextSheetSnap("collapsed")).toBe("half");
    expect(nextSheetSnap("half")).toBe("full");
    expect(nextSheetSnap("full")).toBe("collapsed");
  });
});