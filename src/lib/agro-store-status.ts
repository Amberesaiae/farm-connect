export type AgroStoreStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "suspended"
  | "rejected";

export const AGRO_STORE_STATUS_LABEL: Record<AgroStoreStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  approved: "Approved",
  suspended: "Suspended",
  rejected: "Rejected",
};

export const AGRO_STORE_STATUS_TONE: Record<AgroStoreStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  suspended: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
};

export type AgroPillar =
  | "agrofeed_supplements"
  | "agromed_veterinary"
  | "agro_equipment_tools";

export const AGRO_PILLAR_LABEL: Record<AgroPillar, string> = {
  agrofeed_supplements: "Feed & Supplements",
  agromed_veterinary: "Agromed / Veterinary",
  agro_equipment_tools: "Equipment & Tools",
};

export const AGRO_PILLAR_OPTIONS: { value: AgroPillar; label: string }[] = [
  { value: "agrofeed_supplements", label: "Feed & Supplements" },
  { value: "agromed_veterinary", label: "Agromed / Veterinary" },
  { value: "agro_equipment_tools", label: "Equipment & Tools" },
];
