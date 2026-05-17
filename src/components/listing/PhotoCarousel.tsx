import { useEffect, useState } from "react";
import { listingPhotoUrl } from "@/lib/photo-url";
import { cn } from "@/lib/utils";
import { CloseIcon, ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

export function PhotoCarousel({ paths, alt }: { paths: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % paths.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + paths.length) % paths.length);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox, paths.length]);

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
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="block h-full w-full cursor-zoom-in"
          aria-label="Open photo in full screen"
        >
          <img
            src={listingPhotoUrl(paths[idx])}
            alt={`${alt} — photo ${idx + 1} of ${paths.length}`}
            className="h-full w-full object-cover transition-transform hover:scale-[1.01]"
          />
        </button>
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

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <CloseIcon size={22} />
          </button>
          {paths.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + paths.length) % paths.length); }}
                className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ArrowLeftIcon size={22} />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % paths.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ArrowRightIcon size={22} />
              </button>
            </>
          )}
          <img
            src={listingPhotoUrl(paths[idx])}
            alt={`${alt} — photo ${idx + 1} of ${paths.length}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          />
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white">
            {idx + 1} / {paths.length}
          </span>
        </div>
      )}
    </div>
  );
}
