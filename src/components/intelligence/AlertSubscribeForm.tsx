"use client";

import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { FilterBar } from "@/components/filters/FilterBar";
import type { ListingFilters } from "@/lib/types";

export function AlertSubscribeForm() {
  const [email, setEmail] = useState("");
  const [filters, setFilters] = useState<ListingFilters>({});
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, filters }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Subscription failed");
      setStatus("ok");
      setMessage("You're subscribed. We'll email you when matching listings appear.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Subscription failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="alert-email" className="mb-1 block text-sm font-medium text-slate-700">
          Email address
        </label>
        <input
          id="alert-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@firm.com"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Alert filters</p>
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Bell className="h-4 w-4" aria-hidden />
        )}
        Subscribe to alerts
      </button>

      {message && (
        <p
          className={`text-sm ${status === "error" ? "text-red-700" : "text-emerald-700"}`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}