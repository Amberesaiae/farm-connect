import { PromoBanner } from "@/components/shared/PromoBanner";
import promoHatchery from "@/assets/promo-hatchery.jpg";
import promoAgro from "@/assets/promo-agro.jpg";
import { DisplayAccent } from "@/components/shared/DisplayAccent";

export function PromoPair() {
  return (
    <section aria-label="Featured offerings" className="grid gap-5 md:grid-cols-2">
      <PromoBanner
        eyebrow="Approved hatcheries"
        title={
          <>
            Day-olds reserved <DisplayAccent>straight</DisplayAccent> from the brooder.
          </>
        }
        description="Browse approved poultry and fish hatcheries. Lock in your batch before it sells out."
        image={promoHatchery}
        imageAlt="A wicker basket of fresh eggs beside sacks of feed and a yellow chick on a cream background"
        cta={{ to: "/hatcheries", label: "See hatcheries" }}
        tone="butter"
      />
      <PromoBanner
        eyebrow="Agro essentials"
        title={
          <>
            Feed, vet meds & tools — <DisplayAccent>verified</DisplayAccent> vendors.
          </>
        }
        description="Stock up from trusted agro shops with delivery options across the country."
        image={promoAgro}
        imageAlt="A raffia basket holding feed bags, mineral licks and veterinary supplies on a cream background"
        cta={{ to: "/stores", label: "Open directory" }}
        tone="mint"
      />
    </section>
  );
}