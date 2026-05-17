import { Link } from "@tanstack/react-router";
import { ListingsIcon, TagIcon, CompassIcon } from "@/components/icons";
import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons/Icon";

interface Role {
  to: "/listings" | "/post" | "/services";
  eyebrow: string;
  title: string;
  copy: string;
  Icon: ComponentType<IconProps>;
  tone: "primary" | "clay" | "info";
}

const ROLES: Role[] = [
  {
    to: "/listings",
    eyebrow: "I want to buy",
    title: "Find livestock",
    copy: "Cattle, goats, sheep, poultry from verified farmers — filter by region and breed.",
    Icon: ListingsIcon,
    tone: "primary",
  },
  {
    to: "/post",
    eyebrow: "I want to sell",
    title: "List my animals",
    copy: "Post in 3 steps. Reach buyers across 16 regions, talk on WhatsApp.",
    Icon: TagIcon,
    tone: "clay",
  },
  {
    to: "/services",
    eyebrow: "I need help",
    title: "Vets, feed & hatcheries",
    copy: "Book a vet, find a hatchery, source feed — all in one place.",
    Icon: CompassIcon,
    tone: "info",
  },
];

const TONE: Record<Role["tone"], { ring: string; chip: string; bg: string }> = {
  primary: {
    ring: "group-hover:border-primary",
    chip: "bg-primary-soft text-primary",
    bg: "bg-primary-soft",
  },
  clay: {
    ring: "group-hover:border-[color:var(--accent-2)]",
    chip: "bg-[color:var(--accent-2)]/10 text-[color:var(--accent-2)]",
    bg: "bg-[color:var(--accent-2)]/10",
  },
  info: {
    ring: "group-hover:border-[color:var(--info)]",
    chip: "bg-info-soft text-[color:var(--info)]",
    bg: "bg-info-soft",
  },
};

export function RolePicker() {
  return (
    <section aria-label="What do you want to do?" className="grid gap-4 md:grid-cols-3">
      {ROLES.map((r) => {
        const tone = TONE[r.tone];
        return (
          <Link
            key={r.to}
            to={r.to}
            className={`group fl-lift relative flex flex-col gap-4 overflow-hidden rounded-3xl border-[1.5px] border-border bg-card p-6 transition-colors ${tone.ring}`}
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tone.bg}`}
            >
              <r.Icon size={28} />
            </span>
            <div className="space-y-1.5">
              <p
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em] ${tone.chip}`}
              >
                {r.eyebrow}
              </p>
              <h3 className="font-display text-[20px] font-extrabold leading-tight tracking-tight text-foreground">
                {r.title}
              </h3>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">{r.copy}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary">
              Go <span aria-hidden>→</span>
            </span>
          </Link>
        );
      })}
    </section>
  );
}