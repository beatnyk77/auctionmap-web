"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Loader2 } from "lucide-react";
import type { ListingFilters } from "@/lib/types";

interface SaveSearchButtonProps {
  filters: ListingFilters;
  isAuthenticated: boolean;
}

export function SaveSearchButton({ filters, isAuthenticated }: SaveSearchButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link
        href="/login?redirect=/search"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Bookmark className="h-4 w-4" aria-hidden />
        Sign in to save
      </Link>
    );
  }

  async function handleSave() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/workflow/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), filters }),
      });
      if (res.ok) {
        setDone(true);
        setOpen(false);
        setName("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setDone(false);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Bookmark className="h-4 w-4" aria-hidden />
        {done ? "Saved" : "Save search"}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <label htmlFor="search-name" className="block text-sm font-medium text-slate-700">
            Search name
          </label>
          <input
            id="search-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Delhi residential Green"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
          <button
            type="button"
            disabled={loading || !name.trim()}
            onClick={handleSave}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Save
          </button>
        </div>
      )}
    </div>
  );
}