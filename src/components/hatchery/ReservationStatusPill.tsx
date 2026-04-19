import { cn } from "@/lib/utils";
import {
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_TONE,
  type ReservationStatus,
} from "@/lib/reservation-status";

export function ReservationStatusPill({
  status,
  className,
}: {
  status: ReservationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider",
        RESERVATION_STATUS_TONE[status],
        className,
      )}
    >
      {RESERVATION_STATUS_LABEL[status]}
    </span>
  );
}
