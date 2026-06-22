export type SheetSnap = "collapsed" | "half" | "full";

export const SHEET_PEEK_HEIGHT_PX = 72;
const SHEET_HALF_RATIO = 0.5;
const SHEET_FULL_RATIO = 0.88;
const SHEET_MAX_RATIO = 0.92;

export function sheetHeightForSnap(snap: SheetSnap, viewportHeight: number): number {
  if (viewportHeight <= 0) return SHEET_PEEK_HEIGHT_PX;
  switch (snap) {
    case "collapsed":
      return SHEET_PEEK_HEIGHT_PX;
    case "half":
      return Math.round(viewportHeight * SHEET_HALF_RATIO);
    case "full":
      return Math.round(viewportHeight * SHEET_FULL_RATIO);
  }
}

export function sheetSnapHeights(viewportHeight: number): Record<SheetSnap, number> {
  return {
    collapsed: sheetHeightForSnap("collapsed", viewportHeight),
    half: sheetHeightForSnap("half", viewportHeight),
    full: sheetHeightForSnap("full", viewportHeight),
  };
}

export function clampSheetHeight(heightPx: number, viewportHeight: number): number {
  const max = Math.round(viewportHeight * SHEET_MAX_RATIO);
  return Math.max(SHEET_PEEK_HEIGHT_PX, Math.min(max, Math.round(heightPx)));
}

export function nearestSheetSnap(heightPx: number, viewportHeight: number): SheetSnap {
  const heights = sheetSnapHeights(viewportHeight);
  let best: SheetSnap = "collapsed";
  let bestDelta = Number.POSITIVE_INFINITY;

  for (const snap of Object.keys(heights) as SheetSnap[]) {
    const delta = Math.abs(heights[snap] - heightPx);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = snap;
    }
  }

  return best;
}

export function nextSheetSnap(snap: SheetSnap): SheetSnap {
  if (snap === "collapsed") return "half";
  if (snap === "half") return "full";
  return "collapsed";
}