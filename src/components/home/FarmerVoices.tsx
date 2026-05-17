import { TESTIMONIALS } from "@/lib/testimonials";

const TIER_COLOR: Record<string, string> = {
  "Sprout": "bg-muted text-muted-foreground",
  "Grower": "bg-info-soft text-[color:var(--info)]",
  "Trusted": "bg-primary-soft text-primary",
  "Verified Pro": "bg-[color:var(--accent-2)]/15 text-[color:var(--accent-2)]",
};

export function FarmerVoices() {
  return (
    <section aria-label="Farmer voices">
      <div className="mb-6">
        <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary/80">
          Voices from the farm
        </p>
        <h2 className="font-display mt-1.5 text-[22px] font-extrabold tracking-tight md:text-[26px]">
          What sellers & buyers are saying
        </h2>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <li
            key={t.id}
            className="fl-lift flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6"
          >
            <span aria-hidden className="font-display text-[44px] leading-none text-primary/30">"</span>
            <blockquote className="flex-1 text-[14.5px] leading-relaxed text-foreground">
              {t.quote}
            </blockquote>
            <div className="flex items-center gap-3 border-t border-border pt-4">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-[15px] font-extrabold text-primary"
              >
                {t.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-foreground">{t.name}</p>
                <p className="truncate text-[11.5px] text-muted-foreground">
                  {t.role} · {t.region}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TIER_COLOR[t.tier]}`}>
                {t.tier}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
