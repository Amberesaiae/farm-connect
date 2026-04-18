import { useState } from "react";
import { listingPhotoUrl } from "@/lib/photo-url";
import { cn } from "@/lib/utils";

export function PhotoCarousel({ paths, alt }: { paths: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  if (!paths.length) {
    return (
      <div className="aspect-[4/3] w-full rounded-xl bg-surface flex items-center justify-center text-sm text-muted-foreground">
        No photos
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface">
        <img
          src={listingPhotoUrl(paths[idx])}
          alt={`${alt} — photo ${idx + 1} of ${paths.length}`}
          className="h-full w-full object-cover"
        />
        {paths.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {paths.map((_, i) => (
              <button
                key={i}
                aria-label={`Show photo ${i + 1}`}
                onClick={() => setIdx(i)}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all",
                  i === idx ? "w-6 bg-white" : "bg-white/60",
                )}
              />
            ))}
          </div>
        )}
      </div>
      {paths.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {paths.map((p, i) => (
            <button
              key={p}
              onClick={() => setIdx(i)}
              className={cn(
                "shrink-0 overflow-hidden rounded-md border-2",
                i === idx ? "border-primary" : "border-transparent",
              )}
              aria-label={`Thumbnail ${i + 1}`}
            >
              <img
                src={listingPhotoUrl(p)}
                alt=""
                className="h-14 w-14 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
