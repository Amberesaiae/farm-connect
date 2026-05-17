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
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.onRemove}
          className="fl-lift inline-flex h-7 items-center gap-1 rounded-full border border-border bg-card pl-2.5 pr-1.5 text-[11.5px] font-semibold text-foreground hover:border-primary"
        >
          <span className="truncate max-w-[160px]">{c.label}</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground">
            <CloseIcon size={11} />
          </span>
        </button>
      ))}
      {onClearAll ? (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-1 text-[11.5px] font-semibold text-primary hover:underline"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}
