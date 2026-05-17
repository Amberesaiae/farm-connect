import { ShieldIcon, WhatsAppIcon, TruckIcon, VerifiedBadgeIcon } from "@/components/icons";

const ITEMS = [
  {
    Icon: VerifiedBadgeIcon,
    title: "Verified farmers",
    copy: "ID, phone & licence checks before any badge appears.",
  },
  {
    Icon: WhatsAppIcon,
    title: "Direct WhatsApp",
    copy: "Talk to the seller — no middlemen, no commissions on chats.",
  },
  {
    Icon: TruckIcon,
    title: "16 regions covered",
    copy: "Cattle from the North, goats from Ashanti, poultry nationwide.",
  },
  {
    Icon: ShieldIcon,
    title: "Report any listing",
    copy: "Our moderators review reports within 24 hours.",
  },
];

export function TrustStrip() {
  return (
    <section aria-label="How farmlink protects you">
      <div className="mb-6 flex items-baseline gap-4">
        <h2 className="font-display text-[20px] font-extrabold tracking-tight md:text-[22px]">
          Built for trust
        </h2>
        <span aria-hidden className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          On every listing
        </span>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((it) => (
          <li
            key={it.title}
            className="fl-lift flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <it.Icon size={22} />
            </span>
            <div>
              <p className="text-[14px] font-bold text-foreground">{it.title}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                {it.copy}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}