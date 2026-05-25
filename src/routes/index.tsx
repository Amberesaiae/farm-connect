import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { HomeHero } from "@/components/home/HomeHero";
import { CategoryList } from "@/components/home/CategoryList";
import { FreshListings } from "@/components/home/FreshListings";
import { ServicesAndHatcheries } from "@/components/home/ServicesAndHatcheries";
import { AgroVendorStrip } from "@/components/home/AgroVendorStrip";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FarmerVoices } from "@/components/home/FarmerVoices";
import { PromoPair } from "@/components/home/PromoPair";
import mixedHero from "@/assets/mixed-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "farmlink — Ghana's livestock marketplace" },
      {
        name: "description",
        content:
          "Buy and sell livestock direct from verified Ghanaian farmers. Vets, hatcheries, agro-vendors and 16-region coverage — all on WhatsApp, no middlemen.",
      },
      { property: "og:title", content: "farmlink — Ghana's livestock marketplace" },
      {
        property: "og:description",
        content:
          "Direct from farmer to buyer. WhatsApp contact, verified sellers, 16 regions covered.",
      },
      { property: "og:image", content: mixedHero },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: mixedHero },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <HomeHero />

        {/* Primary discovery — pastel category discs sit right under the hero */}
        <section className="mt-12 md:mt-16" aria-label="Browse by animal">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Browse by animal
              </p>
              <h2 className="font-display mt-2 text-[28px] font-extrabold leading-[1.05] tracking-tight md:text-[36px]">
                Pick your animal. We'll show you the farms.
              </h2>
            </div>
          </div>
          <CategoryList />
        </section>

        <div className="mt-12 md:mt-16">
          <PromoPair />
        </div>

        {/* Primary browse hook — largest type, most breathing room */}
        <div className="mt-16 md:mt-24">
          <FreshListings />
        </div>

        <div className="mt-16 md:mt-24">
          <ServicesAndHatcheries />
        </div>

        <div className="mt-16 md:mt-24">
          <AgroVendorStrip />
        </div>

        <div className="mt-16 md:mt-24">
          <HowItWorks />
        </div>

        <div className="mt-16 md:mt-24">
          <FarmerVoices />
        </div>
      </div>
    </AppShell>
  );
}