export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  region: string;
  tier: "Sprout" | "Grower" | "Trusted" | "Verified Pro";
}

/**
 * Static seed testimonials. Future iteration: move to a moderated DB table.
 * Names + farms are illustrative and reviewed for cultural authenticity.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-abena",
    quote: "I sold five Boer goats in one weekend. The WhatsApp button means buyers don't waste time — they come ready.",
    name: "Abena Mensah",
    role: "Goat farmer",
    region: "Ashanti",
    tier: "Verified Pro",
  },
  {
    id: "t-yaw",
    quote: "Before farmlink I had to drive to Tamale to find a good Sanga bull. Now I scroll, I message, I pick up.",
    name: "Yaw Asante",
    role: "Cattle buyer",
    region: "Bono",
    tier: "Trusted",
  },
  {
    id: "t-fatima",
    quote: "Day-old chicks listed Monday, all booked by Wednesday. The hatchery badge built trust fast.",
    name: "Fatima Issah",
    role: "Hatchery owner",
    region: "Northern",
    tier: "Verified Pro",
  },
];
