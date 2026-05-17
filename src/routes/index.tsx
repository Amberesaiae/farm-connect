import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { HomeHero } from "@/components/home/HomeHero";
import { RolePicker } from "@/components/home/RolePicker";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { FreshListings } from "@/components/home/FreshListings";
import { TrustStrip } from "@/components/home/TrustStrip";
import mixedHero from "@/assets/mixed-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "farmlink — Ghana's livestock marketplace" },
      {
        name: "description",
        content:
          "Buy and sell cattle, goats, sheep and poultry direct from verified Ghanaian farmers. Vets, hatcheries and feed in one place. No middlemen.",
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
    <AppShell showTrust>
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-6 md:space-y-16 md:px-8 md:py-10">
        <HomeHero />

        <RolePicker />

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Browse by animal
              </p>
              <h2 className="font-display mt-1 text-[22px] font-extrabold tracking-tight md:text-[26px]">
                Pick your category
              </h2>
            </div>
          </div>
          <CategoryStrip />
        </section>

        <FreshListings />

        <TrustStrip />
      </div>
    </AppShell>
  );
}