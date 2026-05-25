import { TESTIMONIALS } from "@/lib/testimonials";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { DisplayAccent } from "@/components/shared/DisplayAccent";

const TIER_COLOR: Record<string, string> = {
  "Sprout": "bg-muted text-muted-foreground",
  "Grower": "bg-info-soft text-[color:var(--info)]",
  "Trusted": "bg-primary-soft text-primary",
  "Verified Pro": "bg-[color:var(--accent-2)]/15 text-[color:var(--accent-2)]",
};

export function FarmerVoices() {
  return (
    <section aria-label="Farmer voices">
      <SectionHeader
        eyebrow="Voices from the farm"
        title={
          <>
            What sellers <DisplayAccent>&amp; buyers</DisplayAccent> are saying
          </>
        }
      />

      <ul className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
        {TESTIMONIALS.map((t) => (
          <li
            key={t.id}
            className="flex h-full flex-col gap-5"
          >
            <span
              aria-hidden
              className="font-display italic leading-none text-primary text-[88px]"
              style={{ marginBottom: "-32px" }}
            >
              “
            </span>
            <blockquote className="font-display flex-1 text-[20px] font-semibold leading-[1.35] tracking-tight text-foreground md:text-[22px]">
              {t.quote}
            </blockquote>
            <div className="mt-2 flex items-center gap-3">
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
