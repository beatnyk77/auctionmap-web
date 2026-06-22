import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  MapPin,
  Building2,
  Shield,
} from "lucide-react";
import { fetchListingDetail } from "@/lib/listings";
import {
  circleRateDiscount,
  deriveRiskReasons,
  fetchPriceHistory,
  fetchPriceSignals,
} from "@/lib/intelligence";
import { RiskBadge } from "@/components/listings/RiskBadge";
import { RiskDetailPanel } from "@/components/intelligence/RiskDetailPanel";
import { PriceHistoryChart } from "@/components/intelligence/PriceHistoryChart";
import { CircleRateBadge } from "@/components/intelligence/CircleRateBadge";
import { formatDate, formatLakhs, formatSqftRate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await fetchListingDetail(id).catch(() => null);

  if (!listing) notFound();

  const [history, signals] = await Promise.all([
    fetchPriceHistory(id).catch(() => []),
    fetchPriceSignals(id).catch(() => null),
  ]);

  const riskReasons = deriveRiskReasons(listing);
  const circleDiscount = circleRateDiscount(
    listing.price_per_sqft,
    listing.circle_rate_per_sqft,
  );

  const location = [listing.locality, listing.city, listing.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to map
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{listing.display_name}</h1>
            {location && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4" aria-hidden />
                {location}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge tier={listing.risk_tier} />
            {circleDiscount != null && <CircleRateBadge discountPct={circleDiscount} />}
          </div>
        </div>

        <RiskDetailPanel
          tier={listing.risk_tier}
          reasons={riskReasons}
          completenessScore={listing.completeness_score}
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Reserve price" value={formatLakhs(listing.reserve_price_lakhs)} />
          <Stat label="EMD" value={formatLakhs(listing.emd_lakhs)} />
          <Stat label="Auction date" value={formatDate(listing.auction_date)} icon={Calendar} />
          <Stat label="₹/sqft" value={formatSqftRate(listing.price_per_sqft)} />
        </div>

        {listing.circle_rate_per_sqft != null && (
          <p className="mb-6 text-sm text-slate-600">
            Circle/guidance rate: {formatSqftRate(listing.circle_rate_per_sqft)}
            {circleDiscount != null && circleDiscount >= 10 && (
              <span className="ml-2 font-medium text-emerald-700">
                Reserve is {circleDiscount}% below circle rate
              </span>
            )}
          </p>
        )}

        <div className="mb-6">
          <PriceHistoryChart history={history} signals={signals} />
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <DetailRow label="Property type" value={listing.property_type} />
          <DetailRow label="Bank" value={listing.bank_name} icon={Building2} />
          <DetailRow label="Auction type" value={listing.auction_type} />
          <DetailRow label="Possession" value={listing.possession_status} />
          <DetailRow label="Encumbrance" value={listing.encumbrance_status} icon={Shield} />
          <DetailRow label="Area" value={listing.area_sqft ? `${listing.area_sqft} sqft` : null} />
          {listing.drt_case_number && (
            <DetailRow label="DRT case" value={listing.drt_case_number} />
          )}
        </div>

        {listing.tags && listing.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {listing.analyst_notes && (
          <div className="mb-6 rounded-xl bg-slate-50 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">Analyst notes</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {listing.analyst_notes}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            Scraped {formatDate(listing.scraped_at)} · Data updated daily · Not legal advice
          </p>
          <a
            href={listing.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            View on {listing.source_code}
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>

      {listing.lat != null && listing.lon != null && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <iframe
            title="Property location"
            className="h-64 w-full"
            loading="lazy"
            src={`https://www.google.com/maps?q=${listing.lat},${listing.lon}&z=15&output=embed`}
          />
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-slate-900">
        {Icon && <Icon className="h-4 w-4 text-slate-400" aria-hidden />}
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />}
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium text-slate-800">{value ?? "—"}</p>
      </div>
    </div>
  );
}