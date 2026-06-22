import Link from "next/link";
import { Calendar, MapPin, IndianRupee } from "lucide-react";
import { formatDate, formatLakhs, formatSqftRate } from "@/lib/utils";
import type { ListingPublic } from "@/lib/types";
import { RiskBadge } from "./RiskBadge";

interface ListingCardProps {
  listing: ListingPublic;
  active?: boolean;
  onHover?: () => void;
  /** Map sidebar: select on card click instead of navigating away */
  onSelect?: () => void;
}

function cardSurfaceClass(active?: boolean): string {
  return `rounded-xl border transition-all ${
    active
      ? "border-slate-900 bg-slate-50 shadow-sm"
      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
  }`;
}

function ListingCardBody({ listing }: { listing: ListingPublic }) {
  const location = [listing.locality, listing.city, listing.state]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
          {listing.display_name}
        </h3>
        <RiskBadge tier={listing.risk_tier} />
      </div>

      {location && (
        <p className="mb-3 flex items-start gap-1.5 text-xs text-slate-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="line-clamp-2">{location}</span>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span className="flex items-center gap-1 font-medium text-slate-900">
          <IndianRupee className="h-3.5 w-3.5" aria-hidden />
          {formatLakhs(listing.reserve_price_lakhs)}
        </span>
        {listing.auction_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {formatDate(listing.auction_date)}
          </span>
        )}
        {listing.property_type && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5">{listing.property_type}</span>
        )}
      </div>

      {listing.price_per_sqft != null && (
        <p className="mt-2 text-xs text-slate-500">
          {formatSqftRate(listing.price_per_sqft)}
        </p>
      )}
    </>
  );
}

export function listingDetailHref(propertyId: string): string {
  return `/property/${propertyId}`;
}

export function ListingCard({ listing, active, onHover, onSelect }: ListingCardProps) {
  const href = listingDetailHref(listing.property_id);

  if (onSelect) {
    return (
      <div className={cardSurfaceClass(active)} data-testid="listing-card-preview">
        <button
          type="button"
          onClick={onSelect}
          onMouseEnter={onHover}
          className="block w-full rounded-xl p-4 text-left"
          aria-pressed={active}
        >
          <ListingCardBody listing={listing} />
        </button>
        <div className="border-t border-slate-100 px-4 py-2.5">
          <Link
            href={href}
            className="text-xs font-medium text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            View details →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      onMouseEnter={onHover}
      data-testid="listing-card-link"
      className={`block p-4 ${cardSurfaceClass(active)}`}
    >
      <ListingCardBody listing={listing} />
    </Link>
  );
}