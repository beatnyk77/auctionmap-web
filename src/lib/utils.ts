import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskTier } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLakhs(value: number | null | undefined): string {
  if (value == null) return "—";
  return `₹${value.toLocaleString("en-IN")}L`;
}

export function formatSqftRate(value: number | null | undefined): string {
  if (value == null) return "—";
  return `₹${Math.round(value).toLocaleString("en-IN")}/sqft`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function riskColor(tier: RiskTier | null | undefined): string {
  switch (tier) {
    case "Green":
      return "#16a34a";
    case "Amber":
      return "#d97706";
    case "Red":
      return "#dc2626";
    default:
      return "#64748b";
  }
}

export function riskBadgeClass(tier: RiskTier | null | undefined): string {
  switch (tier) {
    case "Green":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "Amber":
      return "bg-amber-50 text-amber-900 ring-amber-200";
    case "Red":
      return "bg-red-50 text-red-800 ring-red-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

export function slugifyState(state: string): string {
  return state.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Escape text for safe HTML interpolation in map popups. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}