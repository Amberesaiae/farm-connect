export type HatcheryStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "suspended"
  | "rejected";

export const HATCHERY_STATUS_LABEL: Record<HatcheryStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  approved: "Approved",
  suspended: "Suspended",
  rejected: "Rejected",
};

export const HATCHERY_STATUS_TONE: Record<HatcheryStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  suspended: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
};

export type BatchStatus = "draft" | "open" | "full" | "closed" | "cancelled";

export const BATCH_STATUS_LABEL: Record<BatchStatus, string> = {
  draft: "Draft",
  open: "Open",
  full: "Full",
  closed: "Closed",
  cancelled: "Cancelled",
};
