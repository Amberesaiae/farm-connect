import { useState } from "react";
import { listingPhotoUrl } from "@/lib/photo-url";
import { cn } from "@/lib/utils";

export function PhotoCarousel({ paths, alt }: { paths: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  if (!paths.length) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-surface text-sm text-muted-foreground md:aspect-[4/3]">
        No photos
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface md:aspect-[4/3]">
        <img
          src={listingPhotoUrl(paths[idx])}
          alt={`${alt} — photo ${idx + 1} of ${paths.length}`}
          className="h-full w-full object-cover"
        />
        {paths.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-foreground/30 px-2 py-1.5 backdrop-blur">
            {paths.map((_, i) => (
              <button
                key={i}
                aria-label={`Show photo ${i + 1}`}
                onClick={() => setIdx(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === idx ? "w-5 bg-white" : "w-1.5 bg-white/70",
                )}
              />
            ))}
          </div>
        )}
      </div>
      {paths.length > 1 && (
        <div className="hidden gap-2 overflow-x-auto no-scrollbar md:flex">
          {paths.map((p, i) => (
            <button
              key={p}
              onClick={() => setIdx(i)}
              className={cn(
                "shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === idx ? "border-primary" : "border-transparent",
              )}
              aria-label={`Thumbnail ${i + 1}`}
            >
              <img src={listingPhotoUrl(p)} alt="" className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
