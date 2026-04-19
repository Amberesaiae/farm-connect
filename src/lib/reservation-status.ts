export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "waitlisted"
  | "cancelled_by_buyer"
  | "cancelled_by_hatchery"
  | "fulfilled";

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  waitlisted: "Waitlisted",
  cancelled_by_buyer: "Cancelled by you",
  cancelled_by_hatchery: "Cancelled by hatchery",
  fulfilled: "Fulfilled",
};

export const RESERVATION_STATUS_TONE: Record<ReservationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-primary-soft text-primary",
  waitlisted: "bg-blue-100 text-blue-800",
  cancelled_by_buyer: "bg-muted text-muted-foreground",
  cancelled_by_hatchery: "bg-muted text-muted-foreground",
  fulfilled: "bg-emerald-100 text-emerald-800",
};

export function reservationIsActive(s: ReservationStatus) {
  return s === "pending" || s === "confirmed" || s === "waitlisted";
}
