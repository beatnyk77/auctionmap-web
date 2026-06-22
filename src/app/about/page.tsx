import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">About AuctionMap</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        AuctionMap aggregates distressed property auctions from Indian bank portals — SARFAESI,
        DRT, and related NPA sales — and structures them for map-based discovery and risk-aware
        screening.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Coverage</h2>
      <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
        <li>Primary source: BaankNet (expanding to additional bank portals)</li>
        <li>States: Madhya Pradesh, Maharashtra, Delhi/NCR, Goa (configurable in pipeline)</li>
        <li>Property types: Residential, Commercial, Industrial, Agricultural, Plot/Land</li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Data freshness</h2>
      <p className="mt-3 text-sm text-slate-600">
        Listings are ingested daily at <strong>6:00 AM IST</strong> via an automated pipeline.
        Each listing shows a <em>scraped at</em> timestamp on its detail page.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Risk tiers</h2>
      <p className="mt-3 text-sm text-slate-600">
        Green, Amber, and Red tiers are rule-based signals from possession status, encumbrance,
        litigation keywords, and data completeness. They are indicative — not legal or valuation
        advice.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Disclaimer</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        AuctionMap is an information tool for research purposes only. Reserve prices, possession
        status, and encumbrance details should be verified against the official auction notice and
        through independent legal and valuation due diligence before bidding.
      </p>

      <Link
        href="/"
        className="mt-10 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Back to map
      </Link>
    </div>
  );
}