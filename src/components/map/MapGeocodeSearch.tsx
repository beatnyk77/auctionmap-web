"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";

export interface GeocodeResult {
  label: string;
  lng: number;
  lat: number;
}

interface MapGeocodeSearchProps {
  onSelect: (result: GeocodeResult) => void;
}

export function MapGeocodeSearch({ onSelect }: MapGeocodeSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 3) return;

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", `${query.trim()}, India`);
        url.searchParams.set("format", "json");
        url.searchParams.set("limit", "5");
        url.searchParams.set("countrycodes", "in");

        const res = await fetch(url.toString(), {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{
          display_name: string;
          lon: string;
          lat: string;
        }>;
        setResults(
          data.map((row) => ({
            label: row.display_name,
            lng: Number(row.lon),
            lat: Number(row.lat),
          })),
        );
        setOpen(true);
      } catch {
        // aborted or network error
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="absolute left-3 top-3 z-10 w-full max-w-xs">
      <label htmlFor="map-geocode" className="sr-only">
        Search location
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          id="map-geocode"
          type="search"
          value={query}
          onChange={(e) => {
          const next = e.target.value;
          setQuery(next);
          if (next.trim().length < 3) setResults([]);
        }}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search city or locality…"
          className="w-full rounded-lg border border-slate-200 bg-white/95 py-2.5 pl-9 pr-9 text-sm text-slate-800 shadow-sm outline-none backdrop-blur-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
        {loading && (
          <Loader2
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400"
            aria-hidden
          />
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map((r) => (
            <li key={`${r.lng}-${r.lat}-${r.label}`}>
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                onMouseDown={() => {
                  onSelect(r);
                  setQuery(r.label.split(",")[0] ?? r.label);
                  setOpen(false);
                }}
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                <span className="line-clamp-2">{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}