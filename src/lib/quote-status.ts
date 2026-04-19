export type QuoteStatus =
  | "submitted"
  | "viewed"
  | "responded"
  | "accepted"
  | "declined"
  | "expired";

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  submitted: "Submitted",
  viewed: "Viewed",
  responded: "Responded",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

export const QUOTE_STATUS_TONE: Record<QuoteStatus, string> = {
  submitted: "bg-amber-100 text-amber-800",
  viewed: "bg-blue-100 text-blue-800",
  responded: "bg-primary-soft text-primary",
  accepted: "bg-emerald-100 text-emerald-800",
  declined: "bg-muted text-muted-foreground",
  expired: "bg-muted text-muted-foreground",
};
