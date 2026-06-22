"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Tenant } from "@/lib/tenant";

interface TenantBrandingFormProps {
  tenant: Tenant;
}

export function TenantBrandingForm({ tenant }: TenantBrandingFormProps) {
  const [brandName, setBrandName] = useState(tenant.brand_name);
  const [tagline, setTagline] = useState(tenant.tagline ?? "");
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url ?? "");
  const [primaryColor, setPrimaryColor] = useState(tenant.primary_color);
  const [accentColor, setAccentColor] = useState(tenant.accent_color);
  const [stateFilter, setStateFilter] = useState(
    (tenant.listing_filters as { state?: string }).state ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenant.id,
          brand_name: brandName,
          tagline,
          logo_url: logoUrl || null,
          primary_color: primaryColor,
          accent_color: accentColor,
          listing_filters: stateFilter ? { state: stateFilter } : {},
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Save failed");
      }
      setMessage("Branding saved");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">White-label branding</h2>
        <p className="mt-1 text-sm text-slate-500">
          Subdomain: <strong>{tenant.slug}.auctionmap.in</strong>
        </p>
      </div>

      <Field label="Brand name">
        <input
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </Field>
      <Field label="Tagline">
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </Field>
      <Field label="Logo URL">
        <input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          type="url"
          placeholder="https://..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Primary color">
          <input
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            type="color"
            className="h-10 w-full rounded-lg border border-slate-200"
          />
        </Field>
        <Field label="Accent color">
          <input
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            type="color"
            className="h-10 w-full rounded-lg border border-slate-200"
          />
        </Field>
      </div>
      <Field label="Territory filter (state)">
        <input
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          placeholder="e.g. Maharashtra"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Save branding
      </button>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}