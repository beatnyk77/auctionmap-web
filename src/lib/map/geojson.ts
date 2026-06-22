import type { FeatureCollection, Point } from "geojson";
import type { Bbox, ListingPublic } from "@/lib/types";
import { riskColor } from "@/lib/utils";

export function toGeoJson(
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
          reserve_price_lakhs: l.reserve_price_lakhs,
          active: l.property_id === activeId ? 1 : 0,
        },
      })),
  };
}

export function listingsBbox(listings: ListingPublic[]): Bbox | null {
  const points = listings.filter((l) => l.lat != null && l.lon != null);
  if (points.length === 0) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const l of points) {
    minLng = Math.min(minLng, l.lon);
    minLat = Math.min(minLat, l.lat);
    maxLng = Math.max(maxLng, l.lon);
    maxLat = Math.max(maxLat, l.lat);
  }

  const padLng = Math.max((maxLng - minLng) * 0.08, 0.02);
  const padLat = Math.max((maxLat - minLat) * 0.08, 0.02);

  return {
    minLng: minLng - padLng,
    minLat: minLat - padLat,
    maxLng: maxLng + padLng,
    maxLat: maxLat + padLat,
  };
}

export function bboxToPolygon(bbox: Bbox): GeoJSON.Polygon {
  const { minLng, minLat, maxLng, maxLat } = bbox;
  return {
    type: "Polygon",
    coordinates: [
      [
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat],
      ],
    ],
  };
}