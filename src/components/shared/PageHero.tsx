import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared hero for static / content pages.
 * Eyebrow chip + display headline (children may include <DisplayAccent>) + lede + optional image.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  image,
  imageAlt,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  image?: string;
  imageAlt?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "overflow-hidden rounded-3xl border border-border bg-surface-cream",
        className,
      )}
    >
      <div className={cn("grid gap-0", image ? "md:grid-cols-[1.1fr_1fr]" : "")}>
        <div className="flex flex-col justify-center gap-4 p-8 md:p-12">
          <span className="inline-flex w-fit items-center rounded-full bg-primary-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary">
            {eyebrow}
          </span>
          <h1 className="font-display text-[34px] font-extrabold leading-[1.02] tracking-tight md:text-[52px]">
            {title}
          </h1>
          {lede ? (
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-[16px]">
              {lede}
            </p>
          ) : null}
        </div>
        {image ? (
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px]">
            <img
              src={image}
              alt={imageAlt ?? ""}
              width={1536}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}