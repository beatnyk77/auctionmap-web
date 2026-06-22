import type { GeoJSONSource, Map as MapLibreMap, PointLike } from "maplibre-gl";
import type { Point } from "geojson";
import {
  CLUSTER_COUNT_LAYER,
  CLUSTER_LAYER,
  HEATMAP_LAYER,
  SOURCE_ID,
  UNCLUSTERED_LAYER,
} from "@/lib/map/constants";
import { toGeoJson } from "@/lib/map/geojson";
import type { ListingPublic } from "@/lib/types";

export function addListingsLayers(map: MapLibreMap, listings: ListingPublic[], activeId?: string | null) {
  if (map.getSource(SOURCE_ID)) return;

  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: toGeoJson(listings, activeId),
    cluster: true,
    clusterMaxZoom: 12,
    clusterRadius: 50,
  });

  map.addLayer({
    id: HEATMAP_LAYER,
    type: "heatmap",
    source: SOURCE_ID,
    maxzoom: 11,
    filter: ["!", ["has", "point_count"]],
    layout: { visibility: "none" },
    paint: {
      "heatmap-weight": 1,
      "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 11, 2],
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(15,23,42,0)",
        0.2,
        "#93c5fd",
        0.5,
        "#3b82f6",
        0.8,
        "#1d4ed8",
        1,
        "#0f172a",
      ],
      "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 8, 11, 22],
      "heatmap-opacity": 0.75,
    },
  });

  map.addLayer({
    id: CLUSTER_LAYER,
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#475569",
        10,
        "#334155",
        50,
        "#1e293b",
      ],
      "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 50, 28],
      "circle-opacity": 0.88,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
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
      "text-font": ["Open Sans Regular"],
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
      "circle-radius": ["case", ["==", ["get", "active"], 1], 11, 7],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
}

export function updateListingsData(
  map: MapLibreMap,
  listings: ListingPublic[],
  activeId?: string | null,
) {
  const source = map.getSource(SOURCE_ID);
  if (!source || source.type !== "geojson") return;
  (source as GeoJSONSource).setData(toGeoJson(listings, activeId));
}

export function setHeatmapVisibility(map: MapLibreMap, visible: boolean) {
  if (!map.getLayer(HEATMAP_LAYER)) return;
  map.setLayoutProperty(HEATMAP_LAYER, "visibility", visible ? "visible" : "none");
  map.setLayoutProperty(CLUSTER_LAYER, "visibility", visible ? "none" : "visible");
  map.setLayoutProperty(CLUSTER_COUNT_LAYER, "visibility", visible ? "none" : "visible");
  map.setLayoutProperty(UNCLUSTERED_LAYER, "visibility", visible ? "none" : "visible");
}

export function clusterCoordsFromEvent(
  map: MapLibreMap,
  point: PointLike,
): { clusterId: number; coords: [number, number] } | null {
  const features = map.queryRenderedFeatures(point, { layers: [CLUSTER_LAYER] });
  const feature = features[0];
  const clusterId = feature?.properties?.cluster_id;
  if (clusterId == null || !feature) return null;
  const coords = (feature.geometry as Point).coordinates as [number, number];
  return { clusterId, coords };
}