import { cn } from "@/lib/utils";
import {
  HATCHERY_STATUS_LABEL,
  HATCHERY_STATUS_TONE,
  type HatcheryStatus,
} from "@/lib/hatchery-status";

export function HatcheryStatusPill({
  status,
  className,
}: {
  status: HatcheryStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider",
        HATCHERY_STATUS_TONE[status],
        className,
      )}
    >
      {HATCHERY_STATUS_LABEL[status]}
    </span>
  );
}
