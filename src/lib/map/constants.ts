export const INDIA_CENTER: [number, number] = [78.9629, 22.5937];
export const DEFAULT_ZOOM = 4.8;

/** Known city centers for filter fly-to (lng, lat). */
export const CITY_CENTERS: Record<string, [number, number]> = {
  Bhopal: [77.4126, 23.2599],
  Indore: [75.8577, 22.7196],
  Mumbai: [72.8777, 19.076],
  Pune: [73.8567, 18.5204],
  Nagpur: [79.0882, 21.1458],
  Jabalpur: [79.9864, 23.1815],
  Gwalior: [78.1828, 26.2183],
  Delhi: [77.209, 28.6139],
  Bengaluru: [77.5946, 12.9716],
  Chennai: [80.2707, 13.0827],
  Hyderabad: [78.4867, 17.385],
  Ahmedabad: [72.5714, 23.0225],
  Jaipur: [75.7873, 26.9124],
  Lucknow: [80.9462, 26.8467],
  Goa: [73.8278, 15.4909],
};

export const MAP_STYLE_PRIMARY = "https://tiles.openfreemap.org/styles/liberty";
export const MAP_STYLE_FALLBACK = "https://demotiles.maplibre.org/style.json";

export const SOURCE_ID = "listings";
export const CLUSTER_LAYER = "listings-clusters";
export const CLUSTER_COUNT_LAYER = "listings-cluster-count";
export const UNCLUSTERED_LAYER = "listings-unclustered";
export const HEATMAP_LAYER = "listings-heatmap";
export const DRAW_SOURCE_ID = "draw-rectangle";
export const DRAW_LAYER = "draw-rectangle-fill";
export const DRAW_OUTLINE_LAYER = "draw-rectangle-outline";