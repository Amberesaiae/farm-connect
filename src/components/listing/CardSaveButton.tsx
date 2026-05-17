import { useEffect, useState, type MouseEvent } from "react";
import { HeartIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "fl.saved_listings";

function readSaved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeSaved(set: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    window.dispatchEvent(new CustomEvent("fl:saved-changed"));
  } catch {
    /* ignore */
  }
}

/**
 * Lightweight save heart for grid cards — persists to localStorage only.
 * (Cross-device sync is a follow-up phase.)
 */
export function CardSaveButton({ listingId }: { listingId: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSaved().has(listingId));
    const onChange = () => setSaved(readSaved().has(listingId));
    window.addEventListener("fl:saved-changed", onChange);
    return () => window.removeEventListener("fl:saved-changed", onChange);
  }, [listingId]);

  const toggle = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const set = readSaved();
    if (set.has(listingId)) set.delete(listingId);
    else set.add(listingId);
    writeSaved(set);
    setSaved(set.has(listingId));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? "Unsave listing" : "Save listing"}
      aria-pressed={saved}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-white",
        saved && "text-destructive",
      )}
    >
      <HeartIcon size={18} className={cn(saved && "fill-current")} />
    </button>
  );
}

export function isListingSaved(listingId: string): boolean {
  return readSaved().has(listingId);
}

export function getSavedListingIds(): string[] {
  return Array.from(readSaved());
}