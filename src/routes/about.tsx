import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/faqs";
import {
  CompassIcon,
  ChatBubbleIcon,
  SeedlingIcon,
  StorefrontIcon,
  TruckIcon,
  EggIcon,
} from "@/components/icons";
import { PageHero } from "@/components/shared/PageHero";
import { DisplayAccent } from "@/components/shared/DisplayAccent";
import { SectionHeader } from "@/components/shared/SectionHeader";
import aboutHero from "@/assets/about-hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About farmlink — Ghana's livestock marketplace" },
      {
        name: "description",
        content:
          "farmlink connects Ghanaian livestock farmers and buyers directly — no middlemen, no commissions, just WhatsApp and verified IDs.",
      },
      { property: "og:title", content: "About farmlink" },
      {
        property: "og:description",
        content: "A direct livestock marketplace for Ghanaian farmers and buyers.",
      },
      { property: "og:image", content: aboutHero },
    ],
  }),
  component: AboutPage,
});

const STEPS = [
  {
    Icon: CompassIcon,
    title: "Browse with confidence",
    body: "Filter cattle, goats, sheep, poultry, day-olds and fingerlings by region, breed, age and verification tier — see exactly what's nearby before you reach out.",
  },
  {
    Icon: ChatBubbleIcon,
    title: "Talk to the farmer",
    body: "One tap opens WhatsApp with the seller. Ask for vet records, age, transport notes — the conversation is yours, not ours.",
  },
  {
    Icon: SeedlingIcon,
    title: "Inspect, agree, take delivery",
    body: "Visit the farm or arrange transport with our partners. Mark the deal closed when it's done — that's how trust scores grow.",
  },
];

const ECOSYSTEM: Array<{
  Icon: typeof CompassIcon;
  title: string;
  body: string;
  to: "/listings" | "/hatcheries" | "/services" | "/stores";
  cta: string;
}> = [
  {
    Icon: SeedlingIcon,
    title: "Live animals",
    body: "Cattle, goats, sheep, poultry and fish posted by farmers across all 16 regions.",
    to: "/listings",
    cta: "Browse listings",
  },
  {
    Icon: EggIcon,
    title: "Hatcheries & breeders",
    body: "Reserve day-old chicks, fish fingerlings and breeding stock from approved hatcheries.",
    to: "/hatcheries",
    cta: "See hatcheries",
  },
  {
    Icon: TruckIcon,
    title: "Vets, transport & feed",
    body: "Verified service providers across veterinary, transport, feed and insurance.",
    to: "/services",
    cta: "Find a provider",
  },
  {
    Icon: StorefrontIcon,
    title: "Agro shops",
    body: "Feed, agromed and equipment stores — one directory, every verified vendor.",
    to: "/stores",
    cta: "Open directory",
  },
];

const STATS = [
  { stat: "16", label: "Regions covered", body: "Listings from every corner of Ghana — north to coast." },
  { stat: "0%", label: "Commission", body: "We never take a cut. You set the price, you keep it all." },
  { stat: "WhatsApp", label: "Direct contact", body: "No platform middleman. The farmer's number is the farmer's number." },
];

function AboutPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <PageHero
          eyebrow="About farmlink"
          title={
            <>
              Livestock, <DisplayAccent>direct</DisplayAccent> from the farm that raised them.
            </>
          }
          lede={
            <>
              farmlink is a marketplace built for the way Ghanaian farmers already trade —
              transparent prices, WhatsApp conversations, and verified IDs to keep both
              sides safe. We don't take a cut of your sale. Ever.
            </>
          }
          image={aboutHero}
          imageAlt="A smiling Ghanaian farmer in a blue shirt on a savannah pasture with cattle behind"
        />

        <section className="mt-12 grid gap-8 rounded-3xl border border-border bg-surface-cream p-8 md:mt-16 md:grid-cols-3 md:p-10">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-[44px] font-extrabold leading-none tracking-tight text-primary md:text-[56px]">
                {s.stat}
              </p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-foreground/80">{s.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-14 md:mt-20">
          <SectionHeader
            eyebrow="How it works"
            title={
              <>
                Three steps. <DisplayAccent>From scroll</DisplayAccent> to stable.
              </>
            }
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <article key={s.title} className="rounded-3xl border border-border bg-card p-6">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Step {i + 1}
                </span>
                <s.Icon size={28} strokeWidth={1.7} className="mt-3 text-primary" />
                <h3 className="font-display mt-3 text-[20px] font-extrabold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 md:mt-20">
          <SectionHeader
            eyebrow="The ecosystem"
            title={
              <>
                Everything a farm needs — <DisplayAccent>under</DisplayAccent> one roof.
              </>
            }
            description="Live animals, hatcheries, vets, transport, feed and equipment — all in one verified directory."
            seeAll={{ to: "/how-it-works", label: "How it works" }}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {ECOSYSTEM.map((e) => (
              <Link
                key={e.to}
                to={e.to}
                className="group flex gap-4 rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <e.Icon size={22} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-[16px] font-extrabold tracking-tight">
                    {e.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {e.body}
                  </p>
                  <span className="mt-3 inline-block text-[12px] font-semibold text-primary group-hover:underline">
                    {e.cta} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl bg-primary p-8 text-primary-foreground md:mt-20 md:p-14">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/70">
            Get started
          </span>
          <h2 className="font-display mt-2 text-[28px] font-extrabold leading-tight tracking-tight md:text-[40px]">
            Ready to <span className="italic text-white/95">trade</span>?
          </h2>
          <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-white/85">
            Post your first listing in under three minutes, or browse what farmers across the country have available right now.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/post"
              className="inline-flex min-h-11 items-center rounded-full bg-white px-6 py-3 text-[13.5px] font-bold text-primary transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Post a listing
            </Link>
            <Link
              to="/listings"
              className="inline-flex min-h-11 items-center rounded-full border border-white/40 bg-transparent px-6 py-3 text-[13.5px] font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Browse marketplace
            </Link>
          </div>
        </section>

        <section className="mt-14 md:mt-20" aria-labelledby="about-faq">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            FAQ
          </span>
          <h2 id="about-faq" className="font-display mt-2 text-[28px] font-extrabold tracking-tight md:text-[36px]">
            Common <DisplayAccent>questions</DisplayAccent>
          </h2>
          <Accordion type="single" collapsible className="mt-6 rounded-3xl border border-border bg-card">
            {FAQS.slice(0, 6).map((f, i) => (
              <AccordionItem key={i} value={`about-faq-${i}`} className="px-5">
                <AccordionTrigger className="text-left text-[14.5px] font-semibold text-foreground">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[13.5px] leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-4 text-[12.5px] text-muted-foreground">
            More on the <Link to="/help" className="text-primary underline">Help page</Link> ·{" "}
            Still stuck? <Link to="/contact" className="text-primary underline">Contact us</Link>.
          </p>
        </section>
      </div>
    </AppShell>
  );
}