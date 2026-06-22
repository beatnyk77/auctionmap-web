import { cookies, headers } from "next/headers";
import { createServerSupabase } from "./supabase/server";
import type { ListingFilters } from "./types";

export interface Tenant {
  id: string;
  slug: string;
  brand_name: string;
  tagline: string | null;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  listing_filters: ListingFilters;
  organization_id: string | null;
  active: boolean;
}

const TENANT_COOKIE = "am_tenant_slug";
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "auctionmap.in";

export function parseTenantSlugFromHost(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  if (hostname.endsWith(".localhost")) {
    const sub = hostname.replace(".localhost", "");
    if (sub && sub !== "www") return sub;
    return null;
  }

  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    return null;
  }

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
    if (sub && sub !== "www" && sub !== "app") return sub;
  }

  return null;
}

export async function resolveTenantSlug(): Promise<string | null> {
  const headerStore = await headers();
  const fromHeader = headerStore.get("x-tenant-slug");
  if (fromHeader) return fromHeader;

  const cookieStore = await cookies();
  return cookieStore.get(TENANT_COOKIE)?.value ?? null;
}

export async function fetchTenant(slug: string | null): Promise<Tenant | null> {
  if (!slug) return null;

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("get_tenant_by_slug", {
    p_slug: slug,
  });

  if (error || !data) return null;
  return data as Tenant;
}

export async function getActiveTenant(): Promise<Tenant | null> {
  const slug = await resolveTenantSlug();
  return fetchTenant(slug);
}

export function mergeTenantFilters(
  filters: ListingFilters,
  tenant: Tenant | null,
): ListingFilters {
  if (!tenant?.listing_filters) return filters;
  const tf = tenant.listing_filters as ListingFilters;
  return {
    ...filters,
    state: filters.state ?? tf.state,
    propertyType: filters.propertyType ?? tf.propertyType,
    auctionType: filters.auctionType ?? tf.auctionType,
    riskTier: filters.riskTier ?? tf.riskTier,
    minPrice: filters.minPrice ?? tf.minPrice,
    maxPrice: filters.maxPrice ?? tf.maxPrice,
    minAuctionDate: filters.minAuctionDate ?? tf.minAuctionDate,
    maxAuctionDate: filters.maxAuctionDate ?? tf.maxAuctionDate,
  };
}

export function tenantThemeStyle(tenant: Tenant | null): Record<string, string> {
  if (!tenant) return {};
  return {
    "--tenant-primary": tenant.primary_color,
    "--tenant-accent": tenant.accent_color,
  };
}