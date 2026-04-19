import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CompassIcon, ChatBubbleIcon, SeedlingIcon } from "@/components/icons";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About farmlink — Ghana's livestock marketplace" },
      {
        name: "description",
        content:
          "farmlink connects Ghanaian livestock farmers and buyers directly — no middlemen, no guesswork.",
      },
      { property: "og:title", content: "About farmlink" },
      {
        property: "og:description",
        content: "A direct livestock marketplace for Ghanaian farmers and buyers.",
      },
    ],
  }),
  component: AboutPage,
});

const STEPS = [
  {
    Icon: CompassIcon,
    title: "Browse",
    body: "Filter cattle, goats, sheep, poultry and more by region, breed and price.",
  },
  {
    Icon: ChatBubbleIcon,
    title: "Contact",
    body: "Tap WhatsApp to start a conversation directly with the seller — no platform middleman.",
  },
  {
    Icon: SeedlingIcon,
    title: "Trade",
    body: "Inspect, negotiate and pay the seller directly. We log the trade for trust scores.",
  },
];

function AboutPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-16">
        <header className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary">
            About farmlink
          </span>
          <h1 className="font-display mt-3 text-[34px] font-extrabold leading-[1.05] tracking-tight md:text-[46px]">
            Direct trade for
            <br />
            <span className="text-primary">Ghanaian livestock.</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            farmlink is a marketplace built for the way Ghanaian farmers already trade —
            transparent prices, WhatsApp conversations, and verified IDs to keep both
            sides of the trade safe. We don't take a cut of your sale.
          </p>
        </header>

        <section className="mt-10 grid gap-3 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <article
              key={s.title}
              className="rounded-2xl border-[1.5px] border-border bg-card p-5"
            >
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Step {i + 1}
              </span>
              <s.Icon size={28} strokeWidth={1.7} className="mt-3 text-primary" />
              <h2 className="font-display mt-3 text-[20px] font-extrabold tracking-tight">
                {s.title}
              </h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl bg-primary p-8 text-primary-foreground md:p-12">
          <h2 className="font-display text-[26px] font-extrabold leading-tight tracking-tight md:text-[32px]">
            Ready to sell or buy?
          </h2>
          <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-white/85">
            Post your first listing in under a minute, or browse what farmers across the
            country have available right now.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to="/post"
              className="inline-flex items-center rounded-md bg-white px-5 py-2.5 text-[13.5px] font-semibold text-primary transition-colors hover:bg-white/90"
            >
              Post a listing
            </Link>
            <Link
              to="/listings"
              className="inline-flex items-center rounded-md border-[1.5px] border-white/30 bg-transparent px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Browse marketplace
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
