export function MapSkeleton() {
  return (
    <div
      className="flex h-full min-h-[300px] w-full flex-col items-center justify-center gap-3 bg-slate-100"
      role="status"
      aria-label="Loading map"
    >
      <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
      <p className="text-sm text-slate-500">Loading map…</p>
    </div>
  );
}