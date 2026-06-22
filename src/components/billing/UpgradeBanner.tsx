import Link from "next/link";
import { Sparkles } from "lucide-react";

export function UpgradeBanner({ message }: { message: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="flex items-center gap-2 text-sm text-amber-900">
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
        {message}
      </p>
      <Link
        href="/pricing"
        className="rounded-lg bg-amber-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-800"
      >
        View plans
      </Link>
    </div>
  );
}