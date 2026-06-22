import { AlertSubscribeForm } from "@/components/intelligence/AlertSubscribeForm";

export default function AlertsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Listing alerts</h1>
      <p className="mt-2 text-sm text-slate-600">
        Get an email when new bank auction listings match your filters. Checked daily after the
        6 AM IST ingestion run.
      </p>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <AlertSubscribeForm />
      </div>
    </div>
  );
}