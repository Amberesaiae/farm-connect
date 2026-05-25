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
    <section aria-label="How farmlink works" className="rounded-[32px] bg-surface-cream p-7 md:px-14 md:py-16">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            How it works
          </p>
          <h2 className="font-display mt-2 text-[28px] font-extrabold leading-[1.05] tracking-tight md:text-[40px]">
            Three steps.{" "}
            <span className="display-accent">
              {mode === "buyer" ? "From scroll to stable." : "From post to payday."}
            </span>
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Choose role"
          className="inline-flex self-start rounded-full border border-border bg-card p-1"
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

      <ol key={mode} className="fl-fade-in mt-10 grid gap-5 md:grid-cols-3 md:gap-8">
        {steps.map((s) => (
          <li
            key={s.n}
            className="relative flex flex-col gap-3"
          >
            <span
              aria-hidden
              className="font-display italic text-[64px] font-extrabold leading-none tracking-tight text-primary md:text-[88px]"
            >
              {s.n}
            </span>
            <h3 className="font-display mt-2 text-[20px] font-extrabold tracking-tight text-foreground md:text-[22px]">
              {s.title}
            </h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground md:text-[14px]">
              {s.copy}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex justify-center md:mt-12">
        <Link
          to={mode === "buyer" ? "/listings" : "/post"}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-7 py-3 text-[14px] font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {mode === "buyer" ? "Start browsing" : "Post your first listing"}
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </section>
  );
}
