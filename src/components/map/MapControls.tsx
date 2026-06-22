"use client";

import { Crosshair, Flame, Pencil, X } from "lucide-react";

interface MapControlsProps {
  heatmapOn: boolean;
  drawMode: boolean;
  onToggleHeatmap: () => void;
  onToggleDraw: () => void;
  onFitResults: () => void;
  onClearDraw: () => void;
  hasDrawnArea: boolean;
}

export function MapControls({
  heatmapOn,
  drawMode,
  onToggleHeatmap,
  onToggleDraw,
  onFitResults,
  onClearDraw,
  hasDrawnArea,
}: MapControlsProps) {
  const btn =
    "flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/95 px-2.5 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white";

  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
      <button type="button" className={btn} onClick={onFitResults} title="Fit map to results">
        <Crosshair className="h-3.5 w-3.5" aria-hidden />
        Fit results
      </button>
      <button
        type="button"
        className={`${btn} ${heatmapOn ? "border-blue-300 bg-blue-50 text-blue-800" : ""}`}
        onClick={onToggleHeatmap}
        title="Toggle density heatmap"
      >
        <Flame className="h-3.5 w-3.5" aria-hidden />
        Heatmap
      </button>
      <button
        type="button"
        className={`${btn} ${drawMode ? "border-amber-300 bg-amber-50 text-amber-900" : ""}`}
        onClick={onToggleDraw}
        title="Draw area to filter"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        {drawMode ? "Drawing…" : "Draw area"}
      </button>
      {hasDrawnArea && (
        <button type="button" className={btn} onClick={onClearDraw} title="Clear drawn area">
          <X className="h-3.5 w-3.5" aria-hidden />
          Clear area
        </button>
      )}
    </div>
  );
}