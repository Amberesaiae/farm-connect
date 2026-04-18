import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  className?: string;
};

export function QtyStepper({ value, onChange, min = 1, className }: Props) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-surface-2 p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
