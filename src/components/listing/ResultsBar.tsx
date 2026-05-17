import type { ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ListingSort = "newest" | "oldest" | "price_asc" | "price_desc";

const SORT_LABEL: Record<ListingSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
};

export function ResultsBar({
  count,
  loading,
  sort,
  onSortChange,
  chips,
}: {
  count: number;
  loading: boolean;
  sort: ListingSort;
  onSortChange: (s: ListingSort) => void;
  chips?: ReactNode;
}) {
  return (
    <div className="sticky top-[60px] z-20 -mx-4 mb-4 border-y border-border bg-background/85 px-4 py-3 backdrop-blur md:top-[68px] md:mx-0 md:rounded-2xl md:border md:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-foreground">
          {loading ? "Loading…" : (
            <>
              <span className="font-mono tabular-nums">{count}</span>{" "}
              <span className="font-normal text-muted-foreground">
                listing{count === 1 ? "" : "s"}
              </span>
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="hidden text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground sm:inline">
            Sort
          </span>
          <Select value={sort} onValueChange={(v) => onSortChange(v as ListingSort)}>
            <SelectTrigger className="h-9 w-[160px] rounded-full text-[12.5px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABEL) as ListingSort[]).map((k) => (
                <SelectItem key={k} value={k}>{SORT_LABEL[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {chips ? <div className="mt-2.5">{chips}</div> : null}
    </div>
  );
}
