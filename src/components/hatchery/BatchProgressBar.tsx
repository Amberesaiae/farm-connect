interface Props {
  reserved: number;
  total: number;
  className?: string;
}

export function BatchProgressBar({ reserved, total, className }: Props) {
  const pct = total > 0 ? Math.min(100, Math.round((reserved / total) * 100)) : 0;
  const left = Math.max(0, total - reserved);
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="font-mono font-semibold text-foreground">{left.toLocaleString()} left</span>
        <span className="font-mono text-muted-foreground">
          {reserved.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`${pct}% reserved`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
