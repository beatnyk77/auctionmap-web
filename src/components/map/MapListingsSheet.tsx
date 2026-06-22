"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import {
  clampSheetHeight,
  nearestSheetSnap,
  nextSheetSnap,
  sheetHeightForSnap,
  type SheetSnap,
} from "@/lib/map/sheet-snap";

const DRAG_CLICK_THRESHOLD_PX = 8;

interface MapListingsSheetProps {
  snap: SheetSnap;
  onSnapChange: (snap: SheetSnap) => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function MapListingsSheet({
  snap,
  onSnapChange,
  title,
  subtitle,
  children,
}: MapListingsSheetProps) {
  const [viewportH, setViewportH] = useState(800);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const dragHeightRef = useRef<number | null>(null);
  const dragRef = useRef<{ startY: number; startHeight: number; moved: boolean } | null>(
    null,
  );

  useEffect(() => {
    const update = () => setViewportH(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const restingHeight = sheetHeightForSnap(snap, viewportH);
  const heightPx = dragHeight ?? restingHeight;
  const isExpanded = snap !== "collapsed";

  const handlePointerDown = useCallback(
    (clientY: number) => {
      dragRef.current = { startY: clientY, startHeight: heightPx, moved: false };
    },
    [heightPx],
  );

  const handlePointerMove = useCallback((clientY: number) => {
    const drag = dragRef.current;
    if (!drag) return;
    const deltaY = drag.startY - clientY;
    if (Math.abs(deltaY) > DRAG_CLICK_THRESHOLD_PX) drag.moved = true;
    const next = clampSheetHeight(drag.startHeight + deltaY, viewportH);
    dragHeightRef.current = next;
    setDragHeight(next);
  }, [viewportH]);

  const handlePointerEnd = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;

    if (!drag) return;

    if (!drag.moved) {
      onSnapChange(nextSheetSnap(snap));
      dragHeightRef.current = null;
      setDragHeight(null);
      return;
    }

    const finalHeight = dragHeightRef.current ?? heightPx;
    onSnapChange(nearestSheetSnap(finalHeight, viewportH));
    dragHeightRef.current = null;
    setDragHeight(null);
  }, [heightPx, onSnapChange, snap, viewportH]);

  return (
    <div
      data-testid="map-listings-sheet"
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-2xl border-t border-slate-200 bg-slate-50 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:hidden"
      style={{
        height: heightPx,
        transition: dragHeight == null ? "height 280ms ease-out" : undefined,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Collapse listings panel" : "Expand listings panel"}
        className="shrink-0 touch-none select-none px-4 pb-2 pt-3"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handlePointerDown(e.clientY);
        }}
        onPointerMove={(e) => {
          if (dragRef.current) handlePointerMove(e.clientY);
        }}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSnapChange(nextSheetSnap(snap));
          }
        }}
      >
        <span className="mx-auto mb-2 block h-1 w-10 rounded-full bg-slate-300" />
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
            <p className="truncate text-[11px] text-slate-500">{subtitle}</p>
          </div>
          <ChevronUp
            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </div>
      </div>

      {isExpanded && <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>}
    </div>
  );
}