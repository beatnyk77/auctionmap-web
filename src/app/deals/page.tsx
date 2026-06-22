import Link from "next/link";
import { DealPipeline } from "@/components/workflow/DealPipeline";
import { fetchPipelineDeals } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const deals = await fetchPipelineDeals();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Deal pipeline</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track properties from shortlist through bid and outcome.
          </p>
        </div>
        <Link
          href="/search"
          className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline"
        >
          Find more listings →
        </Link>
      </div>

      <DealPipeline initialDeals={deals} />
    </div>
  );
}