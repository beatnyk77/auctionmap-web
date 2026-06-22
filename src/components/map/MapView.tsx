"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { FeatureCollection, Point } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Bbox, ListingPublic } from "@/lib/types";
import { riskColor } from "@/lib/utils";

interface MapViewProps {
  listings: ListingPublic[];
  activeId?: string | null;
  onBboxChange?: (bbox: Bbox) => void;
  onMarkerClick?: (listing: ListingPublic) => void;
  center?: [number, number];
  zoom?: number;
}

const INDIA_CENTER: [number, number] = [78.9629, 22.5937];
const SOURCE_ID = "listings";
const CLUSTER_LAYER = "listings-clusters";
const CLUSTER_COUNT_LAYER = "listings-cluster-count";
const UNCLUSTERED_LAYER = "listings-unclustered";

function toGeoJson(
  listings: ListingPublic[],
  activeId?: string | null,
): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: listings
      .filter((l) => l.lat != null && l.lon != null)
      .map((l) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [l.lon, l.lat] },
        properties: {
          property_id: l.property_id,
          display_name: l.display_name,
          risk_tier: l.risk_tier ?? "Unscored",
          color: riskColor(l.risk_tier),
          active: l.property_id === activeId ? 1 : 0,
        },
      })),
  };
}

export function MapView({
  listings,
  activeId,
  onBboxChange,
  onMarkerClick,
  center = INDIA_CENTER,
  zoom = 4.8,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const listingsRef = useRef(listings);
  listingsRef.current = listings;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    const emitBbox = () => {
      if (!onBboxChange) return;
      const bounds = map.getBounds();
      if (!bounds) return;
      onBboxChange({
        minLng: bounds.getWest(),
        minLat: bounds.getSouth(),
        maxLng: bounds.getEast(),
        maxLat: bounds.getNorth(),
      });
    };

    map.on("load", () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: toGeoJson(listingsRef.current, activeId),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      });

      map.addLayer({
        id: CLUSTER_LAYER,
        type: "circle",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#334155",
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 50, 28],
          "circle-opacity": 0.85,
        },
      });

      map.addLayer({
        id: CLUSTER_COUNT_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: UNCLUSTERED_LAYER,
        type: "circle",
        source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": ["case", ["==", ["get", "active"], 1], 10, 7],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", CLUSTER_LAYER, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
        if (clusterId == null) return;
        source.getClusterExpansionZoom(clusterId, (err, expansionZoom) => {
          if (err || expansionZoom == null) return;
          const coords = (features[0].geometry as Point).coordinates as [number, number];
          map.easeTo({ center: coords, zoom: expansionZoom });
        });
      });

      map.on("click", UNCLUSTERED_LAYER, (e) => {
        const feature = e.features?.[0];
        const id = feature?.properties?.property_id as string | undefined;
        if (!id) return;
        const listing = listingsRef.current.find((l) => l.property_id === id);
        if (listing) onMarkerClick?.(listing);
      });

      map.on("mouseenter", CLUSTER_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CLUSTER_LAYER, () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", UNCLUSTERED_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", UNCLUSTERED_LAYER, () => {
        map.getCanvas().style.cursor = "";
      });

      emitBbox();
    });

    map.on("moveend", emitBbox);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom, onBboxChange, onMarkerClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    source?.setData(toGeoJson(listings, activeId));
  }, [listings, activeId]);

  return (
    <div className="relative h-full w-full min-h-[300px]">
      <div ref={containerRef} className="h-full w-full" />
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100 p-6 text-center text-sm text-slate-600">
          <p>
            Add <code className="rounded bg-white px-1.5 py-0.5">NEXT_PUBLIC_MAPBOX_TOKEN</code> to{" "}
            <code className="rounded bg-white px-1.5 py-0.5">.env.local</code> for the interactive map.
          </p>
          <p className="text-xs text-slate-500">
            Listings still appear in the sidebar and on the Search page.
          </p>
        </div>
      )}
    </div>
  );
}