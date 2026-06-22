"use client";

import { useCallback, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { buildMapShareUrl, type MapUrlState } from "@/lib/map/url-state";

interface MapShareButtonProps {
  pathname: string;
  getState: () => MapUrlState;
  className?: string;
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy copy
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  return ok;
}

export function MapShareButton({ pathname, getState, className }: MapShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const handleCopy = useCallback(async () => {
    const url = buildMapShareUrl(window.location.origin, pathname, getState());
    const ok = await copyToClipboard(url);
    setError(!ok);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [getState, pathname]);

  const label = copied ? "Link copied" : error ? "Copy failed" : "Copy map link";

  return (
    <button
      type="button"
      data-testid="map-share-button"
      className={className}
      onClick={handleCopy}
      title="Copy shareable map link with current view and filters"
      aria-label={label}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
      ) : (
        <Link2 className="h-3.5 w-3.5" aria-hidden />
      )}
      {copied ? "Copied" : "Share map"}
    </button>
  );
}