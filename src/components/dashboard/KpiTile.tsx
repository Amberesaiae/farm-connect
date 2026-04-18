import type { LucideIcon } from "lucide-react";

interface KpiTileProps {
  label: string;
  value: number | string;
  Icon?: LucideIcon;
}

export function KpiTile({ label, value, Icon }: KpiTileProps) {
  return (
    <div className="rounded-2xl border-[1.5px] border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="font-mono mt-2 text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
