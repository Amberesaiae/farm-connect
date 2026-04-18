import type { LucideIcon } from "lucide-react";

interface KpiTileProps {
  label: string;
  value: number | string;
  Icon?: LucideIcon;
}

export function KpiTile({ label, value, Icon }: KpiTileProps) {
  return (
    <div className="rounded-2xl bg-background p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
