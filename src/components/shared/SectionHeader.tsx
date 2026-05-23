import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Shared section header used across home/listing pages.
 * Eyebrow + display title (children may include <DisplayAccent>) + optional "See all" pill link.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  seeAll,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  seeAll?: { to: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display mt-2 text-[28px] font-extrabold leading-[1.05] tracking-tight md:text-[40px]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground md:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {seeAll ? (
        <Link
          to={seeAll.to as never}
          className="hidden shrink-0 items-center gap-1.5 self-end rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:inline-flex"
        >
          {seeAll.label} <ArrowRightIcon size={14} />
        </Link>
      ) : null}
    </div>
  );
}