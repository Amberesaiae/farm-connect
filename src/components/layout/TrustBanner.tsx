import { ShieldCheck, Truck, MessageCircle, Sprout } from "lucide-react";

const ITEMS = [
  { Icon: ShieldCheck, label: "ID-verified sellers" },
  { Icon: MessageCircle, label: "Direct WhatsApp contact" },
  { Icon: Truck, label: "16-region coverage" },
  { Icon: Sprout, label: "No middlemen, ever" },
];

export function TrustBanner() {
  return (
    <div className="border-y border-warning/40 bg-warning/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 md:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {ITEMS.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-[12.5px] font-semibold text-warning-foreground"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
