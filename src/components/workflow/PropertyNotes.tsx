"use client";

import { useState } from "react";
import { Loader2, StickyNote } from "lucide-react";

interface PropertyNotesProps {
  propertyId: string;
  initialBody: string;
  isAuthenticated: boolean;
}

export function PropertyNotes({
  propertyId,
  initialBody,
  isAuthenticated,
}: PropertyNotesProps) {
  const [body, setBody] = useState(initialBody);
  const [saved, setSaved] = useState(initialBody);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <StickyNote className="h-4 w-4" aria-hidden />
          <a href="/login" className="font-medium text-slate-900 hover:underline">
            Sign in
          </a>{" "}
          to add private notes on this property.
        </p>
      </div>
    );
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/workflow/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: propertyId, body }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(body);
      setMessage("Saved");
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage("Failed to save");
    } finally {
      setLoading(false);
    }
  }

  const dirty = body !== saved;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <StickyNote className="h-4 w-4 text-slate-500" aria-hidden />
        Your notes
        <span className="text-xs font-normal text-slate-400">(private)</span>
      </h2>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Due diligence checklist, bid strategy, contact notes…"
        className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          disabled={loading || !dirty}
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
          Save notes
        </button>
        {message && (
          <span className="text-xs text-slate-500">{message}</span>
        )}
      </div>
    </div>
  );
}