import { cn } from "@/lib/utils";
import { BATCH_STATUS_LABEL, type BatchStatus } from "@/lib/hatchery-status";

const TONE: Record<BatchStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  open: "bg-primary-soft text-primary",
  full: "bg-amber-100 text-amber-800",
  closed: "bg-muted text-muted-foreground",
  cancelled: "bg-red-100 text-red-800",
};

export function BatchStatusPill({ status, className }: { status: BatchStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider",
        TONE[status],
        className,
      )}
    >
      {BATCH_STATUS_LABEL[status]}
    </span>
  );
}
