"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Loader2, Play, Trash2 } from "lucide-react";
import {
  describeFilters,
  filtersToSearchParams,
  type SavedSearch,
} from "@/lib/workflow-types";
import { formatDate } from "@/lib/utils";

interface SavedSearchesListProps {
  initialSearches: SavedSearch[];
}

export function SavedSearchesList({ initialSearches }: SavedSearchesListProps) {
  const [searches, setSearches] = useState(initialSearches);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function removeSearch(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/workflow/saved-searches/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      setSearches((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  if (searches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <p className="text-sm text-slate-600">No saved searches yet.</p>
        <Link
          href="/search"
          className="mt-3 inline-block text-sm font-medium text-slate-900 hover:underline"
        >
          Go to search and save your filters
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {searches.map((search) => {
        const query = filtersToSearchParams(search.filters);
        return (
          <div
            key={search.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <h2 className="font-medium text-slate-900">{search.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {describeFilters(search.filters)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Saved {formatDate(search.updated_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/search?${query}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Play className="h-4 w-4" aria-hidden />
                Run
              </Link>
              <Link
                href={`/search?${query}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" aria-hidden />
                Export via search
              </Link>
              <button
                type="button"
                disabled={busyId === search.id}
                onClick={() => removeSearch(search.id)}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete saved search"
              >
                {busyId === search.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}