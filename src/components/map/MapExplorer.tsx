"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { buildListingsQuery } from "@/lib/filters";
import {
  hasUrlFilters,
  parseMapUrlState,
  serializeMapUrlState,
  type MapUrlState,
} from "@/lib/map/url-state";
import { CITY_CENTERS, DEFAULT_ZOOM, INDIA_CENTER } from "@/lib/map/constants";
import type { SheetSnap } from "@/lib/map/sheet-snap";
import type { Bbox, ListingFilters, ListingPublic } from "@/lib/types";
import { MapControls } from "./MapControls";
import { MapErrorBoundary } from "./MapErrorBoundary";
import { MapGeocodeSearch, type GeocodeResult } from "./MapGeocodeSearch";
import { MapLegend } from "./MapLegend";
import { MapListingsPanel } from "./MapListingsPanel";
import { MapListingsSheet } from "./MapListingsSheet";
import { MapSkeleton } from "./MapSkeleton";
import type { MapViewHandle } from "./MapView";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

type ViewScope = "all" | "viewport" | "drawn";

interface MapExplorerProps {
  initialListings: ListingPublic[];
  isAuthenticated?: boolean;
}

function scopeLabel(scope: ViewScope, city?: string): string {
  if (city) return `In ${city}`;
  switch (scope) {
    case "all":
      return "All listings";
    case "drawn":
      return "In drawn area";
    default:
      return "In map view";
  }
}

export function MapExplorer({
  initialListings,
  isAuthenticated = false,
}: MapExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlParsed = useMemo(() => parseMapUrlState(searchParams), [searchParams]);

  const mapBootstrap = useMemo(
    () => ({
      center: urlParsed.center ?? INDIA_CENTER,
      zoom: urlParsed.zoom ?? DEFAULT_ZOOM,
    }),
    // Stable map init — intentionally not tied to live URL/search param updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const urlViewportRef = useRef(mapBootstrap);
  const mapRef = useRef<MapViewHandle>(null);

  const [listings, setListings] = useState(initialListings);
  const [filters, setFilters] = useState<ListingFilters>(urlParsed.filters);
  const [bbox, setBbox] = useState<Bbox | null>(urlParsed.bbox);
  const [drawnBbox, setDrawnBbox] = useState<Bbox | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(urlParsed.activeId);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>(
    urlParsed.activeId ? "half" : "collapsed",
  );
  const [viewScope, setViewScope] = useState<ViewScope>(
    urlParsed.bbox ? "viewport" : "all",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [fitRequest, setFitRequest] = useState(0);
  const [geocodeTarget, setGeocodeTarget] = useState<{
    lng: number;
    lat: number;
    token: number;
  } | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const deepLinkScrollIdRef = useRef(urlParsed.activeId);
  const skipInitialCityFlyToRef = useRef(urlParsed.center != null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const skipInitialFetchRef = useRef(
    initialListings.length > 0 && !hasUrlFilters(searchParams),
  );
  const urlSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedUrlRef = useRef<string>("");

  const activeId = hoveredId ?? selectedId;
  const effectiveBbox = drawnBbox ?? bbox;
  const scopeSubtitle = scopeLabel(viewScope, filters.city);

  const fetchListings = useCallback(async () => {
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const qs = buildListingsQuery(filters, effectiveBbox);
      const res = await fetch(`/api/listings?${qs}`, { signal: controller.signal });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load listings");
      setListings(json.listings ?? []);
      setViewScope(drawnBbox ? "drawn" : "viewport");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load listings");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [drawnBbox, effectiveBbox, filters]);

  useEffect(() => {
    if (!effectiveBbox) return;
    if (skipInitialFetchRef.current && !filters.city) {
      skipInitialFetchRef.current = false;
      return;
    }
    if (skipInitialFetchRef.current) skipInitialFetchRef.current = false;
    const timer = setTimeout(fetchListings, 300);
    return () => clearTimeout(timer);
  }, [effectiveBbox, filters, fetchListings]);

  useEffect(() => {
    if (!filters.city) return;
    if (skipInitialCityFlyToRef.current) {
      skipInitialCityFlyToRef.current = false;
      return;
    }
    const match = Object.entries(CITY_CENTERS).find(
      ([name]) => name.toLowerCase() === filters.city!.toLowerCase(),
    );
    if (!match) return;
    const [lng, lat] = match[1];
    mapRef.current?.flyTo(lng, lat, 11);
    urlViewportRef.current = { center: [lng, lat], zoom: 11 };
  }, [filters.city]);

  useEffect(() => {
    if (urlSyncTimerRef.current) clearTimeout(urlSyncTimerRef.current);
    urlSyncTimerRef.current = setTimeout(() => {
      const center = urlViewportRef.current.center;
      const qs = serializeMapUrlState({
        filters,
        bbox: effectiveBbox,
        center,
        zoom: urlViewportRef.current.zoom,
        activeId: selectedId,
      });
      const next = qs ? `${pathname}?${qs}` : pathname;
      if (next === lastSyncedUrlRef.current) return;
      lastSyncedUrlRef.current = next;
      router.replace(next, { scroll: false });
    }, 600);
    return () => {
      if (urlSyncTimerRef.current) clearTimeout(urlSyncTimerRef.current);
    };
  }, [filters, effectiveBbox, selectedId, pathname, router]);

  const sorted = useMemo(
    () =>
      [...listings].sort((a, b) => {
        const da = a.auction_date ?? "";
        const db = b.auction_date ?? "";
        return db.localeCompare(da);
      }),
    [listings],
  );

  const scrollToCard = useCallback((propertyId: string) => {
    cardRefs.current[propertyId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  useEffect(() => {
    const propertyId = deepLinkScrollIdRef.current;
    if (!propertyId) return;
    deepLinkScrollIdRef.current = null;
    const timer = setTimeout(() => scrollToCard(propertyId), 500);
    return () => clearTimeout(timer);
  }, [scrollToCard]);

  const handleMarkerClick = useCallback(
    (listing: ListingPublic) => {
      setSelectedId(listing.property_id);
      setSheetSnap("half");
      scrollToCard(listing.property_id);
    },
    [scrollToCard],
  );

  const handleListingHover = useCallback((listing: ListingPublic | null) => {
    setHoveredId(listing?.property_id ?? null);
  }, []);

  const handleCardHover = useCallback((listing: ListingPublic) => {
    setHoveredId(listing.property_id);
    mapRef.current?.flyToListing(listing);
  }, []);

  const handleCardSelect = useCallback((listing: ListingPublic) => {
    setSelectedId(listing.property_id);
    setSheetSnap("half");
    mapRef.current?.flyToListing(listing);
  }, []);

  const handleBboxChange = useCallback((next: Bbox) => {
    setBbox((prev) => {
      if (!prev) return next;
      const epsilon = 0.0001;
      const unchanged =
        Math.abs(prev.minLng - next.minLng) < epsilon &&
        Math.abs(prev.minLat - next.minLat) < epsilon &&
        Math.abs(prev.maxLng - next.maxLng) < epsilon &&
        Math.abs(prev.maxLat - next.maxLat) < epsilon;
      return unchanged ? prev : next;
    });
  }, []);

  const handleViewportChange = useCallback((center: [number, number], zoom: number) => {
    urlViewportRef.current = { center, zoom };
  }, []);

  const handleDrawComplete = useCallback((next: Bbox) => {
    setDrawnBbox(next);
    setDrawMode(false);
    setBbox(next);
    setViewScope("drawn");
  }, []);

  const handleClearDraw = useCallback(() => {
    setDrawnBbox(null);
    setDrawMode(false);
    mapRef.current?.refreshViewportBbox();
    setViewScope("viewport");
  }, []);

  const handleGeocodeSelect = useCallback((result: GeocodeResult) => {
    setGeocodeTarget({ lng: result.lng, lat: result.lat, token: Date.now() });
    urlViewportRef.current = { center: [result.lng, result.lat], zoom: 12 };
  }, []);

  const savedFilters: ListingFilters = useMemo(
    () => ({
      ...filters,
      bbox: effectiveBbox ?? undefined,
    }),
    [filters, effectiveBbox],
  );

  const getShareState = useCallback(
    (): MapUrlState => ({
      filters,
      bbox: effectiveBbox,
      center: urlViewportRef.current.center,
      zoom: urlViewportRef.current.zoom,
      activeId: selectedId,
    }),
    [filters, effectiveBbox, selectedId],
  );

  const listingsPanelProps = {
    listings: sorted,
    filters,
    onFiltersChange: setFilters,
    savedFilters,
    isAuthenticated,
    listingCount: sorted.length,
    scopeSubtitle,
    loading,
    error,
    activeId,
    cardRefs,
    onCardHover: handleCardHover,
    onCardSelect: handleCardSelect,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="relative min-h-0 flex-1">
        <MapErrorBoundary>
          <MapGeocodeSearch onSelect={handleGeocodeSelect} />
          <MapControls
            heatmapOn={heatmapOn}
            drawMode={drawMode}
            onToggleHeatmap={() => setHeatmapOn((v) => !v)}
            onToggleDraw={() => setDrawMode((v) => !v)}
            onFitResults={() => setFitRequest((n) => n + 1)}
            onClearDraw={handleClearDraw}
            hasDrawnArea={drawnBbox != null}
            pathname={pathname}
            getShareState={getShareState}
          />
          <MapLegend />
          <MapView
            ref={mapRef}
            listings={listings}
            activeId={activeId}
            bootstrap={mapBootstrap}
            onBboxChange={handleBboxChange}
            onViewportChange={handleViewportChange}
            onMarkerClick={handleMarkerClick}
            onListingHover={handleListingHover}
            drawMode={drawMode}
            onDrawComplete={handleDrawComplete}
            showHeatmap={heatmapOn}
            drawnBbox={drawnBbox}
            fitRequest={fitRequest}
            geocodeTarget={geocodeTarget}
          />
        </MapErrorBoundary>
        {loading && (
          <div className="absolute left-3 top-[4.5rem] z-30 flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Updating…
          </div>
        )}

        <MapListingsSheet
          snap={sheetSnap}
          onSnapChange={setSheetSnap}
          title={`${sorted.length} listings`}
          subtitle={scopeSubtitle}
        >
          <MapListingsPanel {...listingsPanelProps} />
        </MapListingsSheet>
      </div>

      <aside className="hidden w-[380px] shrink-0 flex-col border-l border-slate-200 bg-slate-50 lg:flex">
        <MapListingsPanel {...listingsPanelProps} />
      </aside>
    </div>
  );
}