export type ServiceCategory =
  | "vet"
  | "transport"
  | "feed"
  | "insurance"
  | "training";

export interface ServiceProvider {
  id: string;
  name: string;
  category: ServiceCategory;
  region: string;
  blurb: string;
  /** E.164 (Ghana) number used to build a wa.me link. */
  whatsappE164: string;
}

export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  vet: "Veterinary",
  transport: "Transport",
  feed: "Feed & Agro-vet",
  insurance: "Insurance",
  training: "Training",
};

/**
 * Curated partner directory — placeholder data for v1.
 * Real listings will move into a moderated DB table in a follow-up.
 */
export const SERVICES: ServiceProvider[] = [
  {
    id: "svc-vet-accra",
    name: "Greater Accra Mobile Vet",
    category: "vet",
    region: "Greater Accra",
    blurb: "Farm calls, vaccinations, deworming and pregnancy diagnosis.",
    whatsappE164: "+233200000001",
  },
  {
    id: "svc-vet-kumasi",
    name: "Ashanti Livestock Clinic",
    category: "vet",
    region: "Ashanti",
    blurb: "Cattle and small ruminant care, surgeries, lab diagnostics.",
    whatsappE164: "+233200000002",
  },
  {
    id: "svc-transport-tamale",
    name: "Northern Cattle Haulage",
    category: "transport",
    region: "Northern",
    blurb: "8–30 head trucks, insured haulage from Tamale to coastal markets.",
    whatsappE164: "+233200000003",
  },
  {
    id: "svc-transport-kumasi",
    name: "Ashanti Livestock Transit",
    category: "transport",
    region: "Ashanti",
    blurb: "Goats, sheep and poultry transit across the middle belt.",
    whatsappE164: "+233200000004",
  },
  {
    id: "svc-feed-accra",
    name: "Agric Feeds Ghana",
    category: "feed",
    region: "Greater Accra",
    blurb: "Layer mash, broiler starter/finisher, mineral licks, cash & delivery.",
    whatsappE164: "+233200000005",
  },
  {
    id: "svc-feed-bono",
    name: "Sunyani Agro-vet Centre",
    category: "feed",
    region: "Bono",
    blurb: "Bulk concentrates, drugs and vaccines, advice for farmers.",
    whatsappE164: "+233200000006",
  },
  {
    id: "svc-ins-accra",
    name: "Farm Shield Insurance",
    category: "insurance",
    region: "Greater Accra",
    blurb: "Livestock cover for theft, accident and named diseases.",
    whatsappE164: "+233200000007",
  },
  {
    id: "svc-train-tamale",
    name: "Northern Pastoral Academy",
    category: "training",
    region: "Northern",
    blurb: "Short courses on cattle nutrition, herd health and pasture.",
    whatsappE164: "+233200000008",
  },
];
