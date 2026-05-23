import { useEffect, useState } from "react";

// ─── types ────────────────────────────────────────────────────
type GeoCoord = [number, number]; // [lon, lat] — GeoJSON order

function simplifyCoords(coords: GeoCoord[], tolerance: number): GeoCoord[] {
  if (coords.length <= 2) return coords;
  const result: GeoCoord[] = [coords[0]];
  for (let i = 1; i < coords.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = coords[i];
    if (Math.hypot(curr[0] - prev[0], curr[1] - prev[1]) >= tolerance) {
      result.push(curr);
    }
  }
  result.push(coords[coords.length - 1]);
  return result;
}

export function getBoundsZoom(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number,
  mapWidth = 600,
  mapHeight = 400,
  paddingFactor = 0.4
): number {
  const latSpan = (maxLat - minLat) * (1 + paddingFactor) || 0.01;
  const lonSpan = (maxLon - minLon) * (1 + paddingFactor) || 0.01;
  const latZoom = Math.log2((mapHeight / 256) * (180 / latSpan));
  const lonZoom = Math.log2((mapWidth / 256) * (360 / lonSpan));
  const baseZoom = Math.min(Math.max(Math.min(latZoom, lonZoom), 8), 16);

  const zoomOutOffset = 0.6;

  return baseZoom - zoomOutOffset;;
}

function extractCoords(geometry: { type: string; coordinates: any }): GeoCoord[] {
  if (geometry.type === "LineString") return geometry.coordinates as GeoCoord[];
  if (geometry.type === "MultiLineString") return (geometry.coordinates as GeoCoord[][]).flat(1);
  return [];
}

function buildPathParam(coords: GeoCoord[], isPrimary: boolean): string {
  const simplified = simplifyCoords(coords, isPrimary ? 0.0002 : 0.0005);

  const coordStr = simplified
    .map(([lon, lat]) => `lonlat:${lon},${lat}`)
    .join("|");

  const style = isPrimary
    ? `weight:6;color:%23000000`
    : `weight:3;color:%23bbbbbb`;

  return `&path=${coordStr};${style}`;
}

const API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY ?? "";

export async function buildRideMapUrl(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number
): Promise<string> {
  const res = await fetch(
    `https://api.geoapify.com/v1/routing` +
      `?waypoints=${originLat},${originLon}|${destLat},${destLon}` +
      `&mode=drive&alternatives=2&apiKey=${API_KEY}`
  );

  if (!res.ok) throw new Error(`Routing API error: ${res.status}`);

  const data = await res.json();
  const routes: any[] = data.features ?? [];
  if (!routes.length) throw new Error("No routes returned");

  const primaryCoords = extractCoords(routes[0].geometry);

  const allLats = primaryCoords.length
    ? primaryCoords.map(([, lat]) => lat)
    : [originLat, destLat];

  const allLons = primaryCoords.length
    ? primaryCoords.map(([lon]) => lon)
    : [originLon, destLon];

  const minLat = Math.min(...allLats);
  const maxLat = Math.max(...allLats);
  const minLon = Math.min(...allLons);
  const maxLon = Math.max(...allLons);

  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;

  const zoom = getBoundsZoom(minLat, maxLat, minLon, maxLon).toFixed(2);

  const [primary, ...alts] = routes.map((route, i) =>
    buildPathParam(extractCoords(route.geometry), i === 0)
  );

  const originMarker =
    `lonlat:${originLon},${originLat};type:awesome;color:%23222222;size:small;icon:circle`;

  const destMarker =
    `lonlat:${destLon},${destLat};type:awesome;color:%2300aa00;size:small;icon:circle`;

  return (
    `https://maps.geoapify.com/v1/staticmap` +
    `?style=osm-bright-smooth` +
    `&width=600&height=400` +
    `&center=lonlat:${centerLon},${centerLat}` +
    `&zoom=${zoom}` +
    alts.join("") +
    primary +
    `&marker=${originMarker}|${destMarker}` +
    `&apiKey=${API_KEY}`
  );
}

interface UseRideMapResult {
  mapUrl: string | null;
  loading: boolean;
  error: string | null;
}

export function useRideMap({
  origin_latitude,
  origin_longitude,
  destination_latitude,
  destination_longitude,
}: {
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
}): UseRideMapResult {
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      origin_latitude == null ||
      origin_longitude == null ||
      destination_latitude == null ||
      destination_longitude == null
    )
      return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setMapUrl(null);

      try {
        const url = await buildRideMapUrl(
          origin_latitude,
          origin_longitude,
          destination_latitude,
          destination_longitude
        );

        if (!cancelled) setMapUrl(url);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to build map URL");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [
    origin_latitude,
    origin_longitude,
    destination_latitude,
    destination_longitude,
  ]);

  return { mapUrl, loading, error };
}