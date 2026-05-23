import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Shared empty-state primitive used across every list/dashboard surface. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { to: string; label: string };
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-surface-cream px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="grid h-12 w-12 place-items-center rounded-full bg-card text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-[18px] font-extrabold tracking-tight text-foreground">
        {title}
      </h3>
      {description ? (
        <p className="max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? (
        <Link
          to={action.to as never}
          className="mt-2 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {action.label}
        </Link>
      ) : null}
    </Card>
  );
}