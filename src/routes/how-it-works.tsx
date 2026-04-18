import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How farmlink works — buyer & seller guide" },
      {
        name: "description",
        content:
          "Step-by-step guide for buying livestock and for selling on farmlink in Ghana.",
      },
      { property: "og:title", content: "How farmlink works" },
      {
        property: "og:description",
        content: "Buyer and seller guides for the farmlink livestock marketplace.",
      },
    ],
  }),
  component: HowItWorksPage,
});

const BUYER_STEPS = [
  "Browse listings or filter by category, region and price.",
  "Open a listing to see photos, breed, age, weight and seller verification.",
  "Tap Contact on WhatsApp — your message goes straight to the farmer.",
  "Inspect the animal in person before paying. We log the trade for trust scores.",
];

const SELLER_STEPS = [
  "Create an account and verify your Ghana Card to earn the verified badge.",
  "Post a listing in under a minute: category, photos, price and location.",
  "Buyers contact you on WhatsApp — you handle the negotiation and inspection.",
  "Mark the listing sold once the trade is done. Sales boost your trust score.",
];

function HowItWorksPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
        <header className="max-w-2xl">
          <h1 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-tight md:text-[42px]">
            How farmlink works
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
            Whether you're buying your first goat or moving a herd of cattle, the flow is
            the same: browse, contact, inspect, trade.
          </p>
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Guide title="For buyers" steps={BUYER_STEPS} />
          <Guide title="For sellers" steps={SELLER_STEPS} />
        </div>
      </div>
    </AppShell>
  );
}

function Guide({ title, steps }: { title: string; steps: string[] }) {
  return (
    <section className="rounded-2xl border-[1.5px] border-border bg-card p-6">
      <h2 className="font-display text-[22px] font-extrabold tracking-tight">{title}</h2>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-mono text-[12px] font-bold text-primary">
              {i + 1}
            </span>
            <p className="pt-0.5 text-[14px] leading-relaxed text-foreground/90">{s}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
