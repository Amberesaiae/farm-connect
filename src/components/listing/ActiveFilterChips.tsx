import { CloseIcon } from "@/components/icons";

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function ActiveFilterChips({
  chips,
  onClearAll,
}: {
  chips: FilterChip[];
  onClearAll?: () => void;
}) {
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.onRemove}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary-soft pl-3.5 pr-2 text-[12px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="truncate max-w-[180px]">{c.label}</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-card/60">
            <CloseIcon size={11} />
          </span>
        </button>
      ))}
      {onClearAll ? (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-1 text-[12px] font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}
