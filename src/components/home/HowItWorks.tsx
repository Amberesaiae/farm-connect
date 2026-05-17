import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "@/components/icons";

interface Step {
  n: string;
  title: string;
  copy: string;
}

const BUYER: Step[] = [
  { n: "01", title: "Browse the marketplace", copy: "Filter by region, breed, price and verification tier." },
  { n: "02", title: "Chat on WhatsApp", copy: "Talk to the farmer direct. Ask for photos, vet records, age." },
  { n: "03", title: "Meet & take delivery", copy: "Pickup at the farm or arrange transport with our partners." },
];

const SELLER: Step[] = [
  { n: "01", title: "Post in 3 minutes", copy: "Add photos, breed, price and region. Save and resume any time." },
  { n: "02", title: "Get verified", copy: "Submit your ID and farm info to earn the verified badge." },
  { n: "03", title: "Sell direct", copy: "Buyers reach you on WhatsApp. No commissions, no middlemen." },
];

export function HowItWorks() {
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");
  const steps = mode === "buyer" ? BUYER : SELLER;

  return (
    <section aria-label="How farmlink works" className="rounded-3xl border border-border bg-card p-6 md:p-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary/80">
            How it works
          </p>
          <h2 className="font-display mt-1.5 text-[22px] font-extrabold tracking-tight md:text-[28px]">
            Three steps. {mode === "buyer" ? "From scroll to stable." : "From post to payday."}
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Choose role"
          className="inline-flex self-start rounded-full border border-border bg-background p-1"
        >
          {(["buyer", "seller"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              type="button"
              onClick={() => setMode(m)}
              className={
                "min-h-9 rounded-full px-4 text-[12.5px] font-bold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " +
                (mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")
              }
            >
              I'm a {m}
            </button>
          ))}
        </div>
      </div>

      <ol className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
        {steps.map((s, idx) => (
          <li
            key={s.n}
            className="relative flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 md:p-6"
          >
            <span
              aria-hidden
              className="font-display text-[42px] font-extrabold leading-none tracking-tight text-primary/15 md:text-[56px]"
            >
              {s.n}
            </span>
            <h3 className="font-display text-[17px] font-extrabold tracking-tight text-foreground">
              {s.title}
            </h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{s.copy}</p>
            {idx < steps.length - 1 ? (
              <span
                aria-hidden
                className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground md:flex"
              >
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-6">
        <Link
          to={mode === "buyer" ? "/listings" : "/post"}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-3 text-[13.5px] font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {mode === "buyer" ? "Start browsing" : "Post your first listing"}
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </section>
  );
}
