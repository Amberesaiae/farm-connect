import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { HomeHero } from "@/components/home/HomeHero";
import { RolePicker } from "@/components/home/RolePicker";
import { CategoryList } from "@/components/home/CategoryList";
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
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <HomeHero />

        <div className="mt-10 md:mt-14">
          <RolePicker />
        </div>

        {/* Secondary section — quieter header so the hero + Fresh listings stay dominant */}
        <section className="mt-14 md:mt-20">
          <SectionLabel>Browse by animal · live counts</SectionLabel>
          <div className="mt-4">
            <CategoryList />
          </div>
        </section>

        {/* Primary browse hook — largest type, most breathing room */}
        <div className="mt-16 md:mt-24">
          <FreshListings />
        </div>

        <div className="mt-16 md:mt-24">
          <TrustStrip />
        </div>
      </div>
    </AppShell>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="h-px flex-1 bg-border" />
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {children}
      </p>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}