"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  DEFAULT_ZOOM,
  DRAW_LAYER,
  DRAW_OUTLINE_LAYER,
  DRAW_SOURCE_ID,
  INDIA_CENTER,
  MAP_STYLE_FALLBACK,
  MAP_STYLE_PRIMARY,
  UNCLUSTERED_LAYER,
  CLUSTER_LAYER,
  SOURCE_ID,
} from "@/lib/map/constants";
import { bboxToPolygon, listingsBbox, toGeoJson } from "@/lib/map/geojson";
import type { Bbox, ListingPublic } from "@/lib/types";
import { escapeHtml, formatLakhs } from "@/lib/utils";
import {
  addListingsLayers,
  clusterCoordsFromEvent,
  setHeatmapVisibility,
  updateListingsData,
} from "./useMapListingsLayer";

export interface MapViewHandle {
  flyToListing: (listing: ListingPublic) => void;
  fitToListings: (listings: ListingPublic[]) => void;
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  /** Re-emit bbox from current map bounds (e.g. after clearing a drawn area). */
  refreshViewportBbox: () => void;
}

interface MapViewProps {
  listings: ListingPublic[];
  activeId?: string | null;
  onBboxChange?: (bbox: Bbox) => void;
  onViewportChange?: (center: [number, number], zoom: number) => void;
  onMarkerClick?: (listing: ListingPublic) => void;
  onListingHover?: (listing: ListingPublic | null) => void;
  drawMode?: boolean;
  onDrawComplete?: (bbox: Bbox) => void;
  showHeatmap?: boolean;
  drawnBbox?: Bbox | null;
  /** Read once at mount — do not change after init or the map will remount. */
  bootstrap?: { center: [number, number]; zoom: number };
  fitRequest?: number;
  geocodeTarget?: { lng: number; lat: number; token: number } | null;
}

function listingPopupHtml(feature: maplibregl.MapGeoJSONFeature): string {
  const name = escapeHtml(String(feature.properties?.display_name ?? "Listing"));
  const tier = escapeHtml(String(feature.properties?.risk_tier ?? "Unscored"));
  const price = escapeHtml(formatLakhs(feature.properties?.reserve_price_lakhs));
  return `<div class="map-popup">
    <p class="map-popup-title">${name}</p>
    <p class="map-popup-meta">${tier} · ${price}</p>
  </div>`;
}

function ensureDrawLayers(map: MapLibreMap) {
  if (map.getSource(DRAW_SOURCE_ID)) return;

  const empty: FeatureCollection = { type: "FeatureCollection", features: [] };
  map.addSource(DRAW_SOURCE_ID, { type: "geojson", data: empty });

  map.addLayer({
    id: DRAW_LAYER,
    type: "fill",
    source: DRAW_SOURCE_ID,
    paint: { "fill-color": "#3b82f6", "fill-opacity": 0.12 },
  });

  map.addLayer({
    id: DRAW_OUTLINE_LAYER,
    type: "line",
    source: DRAW_SOURCE_ID,
    paint: { "line-color": "#2563eb", "line-width": 2, "line-dasharray": [2, 2] },
  });
}

function setDrawPreview(map: MapLibreMap, bbox: Bbox | null) {
  const source = map.getSource(DRAW_SOURCE_ID) as GeoJSONSource | undefined;
  if (!source) return;
  if (!bbox) {
    source.setData({ type: "FeatureCollection", features: [] });
    return;
  }
  source.setData({
    type: "FeatureCollection",
    features: [{ type: "Feature", geometry: bboxToPolygon(bbox), properties: {} }],
  });
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  {
    listings,
    activeId,
    onBboxChange,
    onViewportChange,
    onMarkerClick,
    onListingHover,
    drawMode = false,
    onDrawComplete,
    showHeatmap = false,
    drawnBbox = null,
    bootstrap,
    fitRequest = 0,
    geocodeTarget = null,
  },
  ref,
) {
  const bootstrapRef = useRef(bootstrap ?? { center: INDIA_CENTER, zoom: DEFAULT_ZOOM });
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const listingsRef = useRef(listings);
  const activeIdRef = useRef(activeId);
  const drawStartRef = useRef<[number, number] | null>(null);
  const drawMoveHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null);

  const onBboxChangeRef = useRef(onBboxChange);
  const onViewportChangeRef = useRef(onViewportChange);
  const onMarkerClickRef = useRef(onMarkerClick);
  const emitBboxRef = useRef<(() => void) | null>(null);
  const onListingHoverRef = useRef(onListingHover);
  const onDrawCompleteRef = useRef(onDrawComplete);
  const drawModeRef = useRef(drawMode);

  onBboxChangeRef.current = onBboxChange;
  onViewportChangeRef.current = onViewportChange;
  onMarkerClickRef.current = onMarkerClick;
  onListingHoverRef.current = onListingHover;
  onDrawCompleteRef.current = onDrawComplete;
  drawModeRef.current = drawMode;
  listingsRef.current = listings;
  activeIdRef.current = activeId;

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [tilesLoading, setTilesLoading] = useState(true);

  const geoJson = useMemo(() => toGeoJson(listings, activeId), [listings, activeId]);

  useImperativeHandle(ref, () => ({
    flyToListing(listing) {
      const map = mapRef.current;
      if (!map || listing.lat == null || listing.lon == null) return;
      map.flyTo({ center: [listing.lon, listing.lat], zoom: Math.max(map.getZoom(), 13), duration: 700 });
    },
    fitToListings(targetListings) {
      const map = mapRef.current;
      const bbox = listingsBbox(targetListings);
      if (!map || !bbox) return;
      map.fitBounds(
        [
          [bbox.minLng, bbox.minLat],
          [bbox.maxLng, bbox.maxLat],
        ],
        { padding: 48, duration: 800, maxZoom: 14 },
      );
    },
    flyTo(lng, lat, zoom = 12) {
      mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 800 });
    },
    refreshViewportBbox() {
      emitBboxRef.current?.();
    },
  }));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;
    let fallbackAttempted = false;
    const { center, zoom } = bootstrapRef.current;

    const initMap = (style: string) => {
      const map = new maplibregl.Map({
        container: containerRef.current!,
        style,
        center,
        zoom,
        attributionControl: { compact: true },
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      popupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: "auctionmap-popup",
      });

      let lastBboxKey = "";
      const emitBbox = () => {
        const bounds = map.getBounds();
        if (!bounds) return;
        const next = {
          minLng: bounds.getWest(),
          minLat: bounds.getSouth(),
          maxLng: bounds.getEast(),
          maxLat: bounds.getNorth(),
        };
        const key = [
          next.minLng.toFixed(4),
          next.minLat.toFixed(4),
          next.maxLng.toFixed(4),
          next.maxLat.toFixed(4),
        ].join(",");
        if (key === lastBboxKey) return;
        lastBboxKey = key;
        onBboxChangeRef.current?.(next);
        const center = map.getCenter();
        onViewportChangeRef.current?.([center.lng, center.lat], map.getZoom());
      };

      emitBboxRef.current = emitBbox;

      map.on("load", () => {
        if (cancelled) return;
        addListingsLayers(map, listingsRef.current, activeIdRef.current);
        ensureDrawLayers(map);
        setMapReady(true);
        setTilesLoading(false);
        emitBbox();
      });

      map.on("error", () => {
        if (cancelled || map.isStyleLoaded()) return;
        if (style === MAP_STYLE_PRIMARY && !fallbackAttempted) {
          fallbackAttempted = true;
          map.remove();
          mapRef.current = null;
          initMap(MAP_STYLE_FALLBACK);
          return;
        }
        if (!map.isStyleLoaded()) {
          setMapError("Map tiles could not be loaded.");
          setTilesLoading(false);
        }
      });

      map.on("moveend", emitBbox);

      map.on("click", CLUSTER_LAYER, async (e) => {
        if (drawModeRef.current) return;
        const hit = clusterCoordsFromEvent(map, e.point);
        if (!hit) return;
        const source = map.getSource(SOURCE_ID) as GeoJSONSource;
        try {
          const expansionZoom = await source.getClusterExpansionZoom(hit.clusterId);
          map.easeTo({ center: hit.coords, zoom: expansionZoom });
        } catch {
          // stale cluster after refresh
        }
      });

      map.on("click", UNCLUSTERED_LAYER, (e) => {
        if (drawModeRef.current) return;
        const feature = e.features?.[0];
        const id = feature?.properties?.property_id as string | undefined;
        if (!id || !feature) return;
        const listing = listingsRef.current.find((l) => l.property_id === id);
        if (listing) {
          onMarkerClickRef.current?.(listing);
          popupRef.current
            ?.setLngLat(e.lngLat)
            .setHTML(listingPopupHtml(feature))
            .addTo(map);
        }
      });

      map.on("mouseenter", UNCLUSTERED_LAYER, (e) => {
        map.getCanvas().style.cursor = "pointer";
        const feature = e.features?.[0];
        if (!feature || !popupRef.current) return;
        const id = feature.properties?.property_id as string | undefined;
        const listing = listingsRef.current.find((l) => l.property_id === id) ?? null;
        onListingHoverRef.current?.(listing);
        popupRef.current
          .setLngLat(e.lngLat)
          .setHTML(listingPopupHtml(feature))
          .addTo(map);
      });

      map.on("mouseleave", UNCLUSTERED_LAYER, () => {
        map.getCanvas().style.cursor = "";
        popupRef.current?.remove();
        onListingHoverRef.current?.(null);
      });

      map.on("mouseenter", CLUSTER_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CLUSTER_LAYER, () => {
        map.getCanvas().style.cursor = "";
      });

      mapRef.current = map;
    };

    initMap(MAP_STYLE_PRIMARY);

    return () => {
      cancelled = true;
      emitBboxRef.current = null;
      popupRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    updateListingsData(map, listings, activeId);
  }, [geoJson, listings, activeId, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    setHeatmapVisibility(map, showHeatmap);
  }, [showHeatmap, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    setDrawPreview(map, drawnBbox);
  }, [drawnBbox, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const cleanupDraw = () => {
      if (drawMoveHandlerRef.current) {
        map.off("mousemove", drawMoveHandlerRef.current);
        drawMoveHandlerRef.current = null;
      }
      map.getCanvas().style.cursor = "";
      drawStartRef.current = null;
    };

    if (!drawMode) {
      cleanupDraw();
      return;
    }

    map.getCanvas().style.cursor = "crosshair";

    const onClick = (e: maplibregl.MapMouseEvent) => {
      if (!drawStartRef.current) {
        drawStartRef.current = [e.lngLat.lng, e.lngLat.lat];
        const moveHandler = (ev: maplibregl.MapMouseEvent) => {
          const start = drawStartRef.current;
          if (!start) return;
          const bbox: Bbox = {
            minLng: Math.min(start[0], ev.lngLat.lng),
            minLat: Math.min(start[1], ev.lngLat.lat),
            maxLng: Math.max(start[0], ev.lngLat.lng),
            maxLat: Math.max(start[1], ev.lngLat.lat),
          };
          setDrawPreview(map, bbox);
        };
        drawMoveHandlerRef.current = moveHandler;
        map.on("mousemove", moveHandler);
        return;
      }

      const start = drawStartRef.current;
      const bbox: Bbox = {
        minLng: Math.min(start[0], e.lngLat.lng),
        minLat: Math.min(start[1], e.lngLat.lat),
        maxLng: Math.max(start[0], e.lngLat.lng),
        maxLat: Math.max(start[1], e.lngLat.lat),
      };
      cleanupDraw();
      setDrawPreview(map, bbox);
      onDrawCompleteRef.current?.(bbox);
    };

    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
      cleanupDraw();
    };
  }, [drawMode, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !activeId) return;
    const listing = listings.find((l) => l.property_id === activeId);
    if (!listing || listing.lat == null || listing.lon == null) return;
    const center = map.getCenter();
    const dist =
      Math.hypot(center.lng - listing.lon, center.lat - listing.lat) * 111;
    if (dist > 2) {
      map.flyTo({
        center: [listing.lon, listing.lat],
        zoom: Math.max(map.getZoom(), 12),
        duration: 600,
      });
    }
  }, [activeId, listings, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || fitRequest === 0) return;
    const bbox = listingsBbox(listings);
    if (!bbox) return;
    map.fitBounds(
      [
        [bbox.minLng, bbox.minLat],
        [bbox.maxLng, bbox.maxLat],
      ],
      { padding: 48, duration: 800, maxZoom: 14 },
    );
  }, [fitRequest, listings, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !geocodeTarget) return;
    map.flyTo({
      center: [geocodeTarget.lng, geocodeTarget.lat],
      zoom: 12,
      duration: 900,
    });
  }, [geocodeTarget, mapReady]);

  if (mapError) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 bg-slate-100 p-6 text-center">
        <p className="text-sm text-slate-700">{mapError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full min-h-[300px]">
      <div
        ref={containerRef}
        className="h-full w-full"
        role="application"
        aria-label="Interactive property map"
      />
      {tilesLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-100/60">
          <p className="rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm">
            Loading tiles…
          </p>
        </div>
      )}
    </div>
  );
});