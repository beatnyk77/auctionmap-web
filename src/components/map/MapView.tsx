"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
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
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom,
      attributionControl: true,
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

    map.on("load", emitBbox);
    map.on("moveend", emitBbox);

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom, onBboxChange]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    listings.forEach((listing) => {
      if (listing.lat == null || listing.lon == null) return;

      const color = riskColor(listing.risk_tier);
      const isActive = listing.property_id === activeId;
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", listing.display_name);
      el.className = "map-marker";
      el.style.cssText = `
        width:${isActive ? 18 : 14}px;
        height:${isActive ? 18 : 14}px;
        border-radius:50%;
        background:${color};
        border:2px solid white;
        box-shadow:0 1px 4px rgba(0,0,0,0.35);
        cursor:pointer;
        transition:transform 0.15s ease;
        transform:scale(${isActive ? 1.2 : 1});
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onMarkerClick?.(listing);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([listing.lon, listing.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [listings, activeId, onMarkerClick]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-6 text-center text-sm text-slate-600">
          Set <code className="mx-1 rounded bg-white px-1.5 py-0.5">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
          in <code className="mx-1 rounded bg-white px-1.5 py-0.5">.env.local</code>
        </div>
      )}
    </div>
  );
}