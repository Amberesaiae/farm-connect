import { cn } from "@/lib/utils";
import { QUOTE_STATUS_LABEL, QUOTE_STATUS_TONE, type QuoteStatus } from "@/lib/quote-status";

export function QuoteStatusPill({
  status,
  className,
}: {
  status: QuoteStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider",
        QUOTE_STATUS_TONE[status],
        className,
      )}
    >
      {QUOTE_STATUS_LABEL[status]}
    </span>
  );
}
