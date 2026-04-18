import { cn } from "@/lib/utils";

type Status = "Pending" | "Completed" | "Cancelled";

const styles: Record<Status, string> = {
  Pending: "bg-secondary/20 text-secondary-foreground",
  Completed: "bg-primary-soft text-[color:var(--accent-foreground)]",
  Cancelled: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
