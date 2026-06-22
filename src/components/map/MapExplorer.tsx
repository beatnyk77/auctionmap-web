"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ListingCard } from "@/components/listings/ListingCard";
import { FilterBar } from "@/components/filters/FilterBar";
import { SaveSearchButton } from "@/components/workflow/SaveSearchButton";
import { buildListingsQuery } from "@/lib/filters";
import { hasUrlFilters, parseMapUrlState, serializeMapUrlState } from "@/lib/map/url-state";
import { CITY_CENTERS, DEFAULT_ZOOM, INDIA_CENTER } from "@/lib/map/constants";
import type { Bbox, ListingFilters, ListingPublic } from "@/lib/types";
import { MapControls } from "./MapControls";
import { MapErrorBoundary } from "./MapErrorBoundary";
import { MapGeocodeSearch, type GeocodeResult } from "./MapGeocodeSearch";
import { MapLegend } from "./MapLegend";
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
  const fetchAbortRef = useRef<AbortController | null>(null);
  const skipInitialFetchRef = useRef(
    initialListings.length > 0 && !hasUrlFilters(searchParams),
  );
  const urlSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedUrlRef = useRef<string>("");

  const activeId = hoveredId ?? selectedId;
  const effectiveBbox = drawnBbox ?? bbox;

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

  const handleMarkerClick = useCallback(
    (listing: ListingPublic) => {
      setSelectedId(listing.property_id);
      scrollToCard(listing.property_id);
    },
    [scrollToCard],
  );

  const handleListingHover = useCallback((listing: ListingPublic | null) => {
    setHoveredId(listing?.property_id ?? null);
  }, []);

  const handleCardHover = useCallback(
    (listing: ListingPublic) => {
      setHoveredId(listing.property_id);
      mapRef.current?.flyToListing(listing);
    },
    [],
  );

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

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="relative min-h-[45vh] flex-1 lg:min-h-0">
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
          <div className="absolute left-3 top-[4.5rem] flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Updating…
          </div>
        )}
      </div>

      <aside className="flex w-full flex-col border-t border-slate-200 bg-slate-50 lg:w-[380px] lg:border-l lg:border-t-0">
        <div className="border-b border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {sorted.length} listings
              </h2>
              <p className="text-[11px] text-slate-500">
                {scopeLabel(viewScope, filters.city)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SaveSearchButton filters={savedFilters} isAuthenticated={isAuthenticated} />
              <p className="hidden text-[11px] text-slate-500 sm:block">Updated daily 6 AM IST</p>
            </div>
          </div>
          <FilterBar filters={filters} onChange={setFilters} compact />
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {!error && sorted.length === 0 && !loading && (
            <p className="px-2 py-8 text-center text-sm text-slate-500">
              No map-ready listings in this area yet. Pan the map or clear filters to see more.
            </p>
          )}
          {sorted.map((listing) => (
            <div
              key={listing.property_id}
              ref={(el) => {
                cardRefs.current[listing.property_id] = el;
              }}
            >
              <ListingCard
                listing={listing}
                active={listing.property_id === activeId}
                onHover={() => handleCardHover(listing)}
              />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}