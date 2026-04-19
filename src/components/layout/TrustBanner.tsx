import {
  ShieldIcon,
  TruckIcon,
  ChatBubbleIcon,
  SeedlingIcon,
} from "@/components/icons";
import type { IconProps } from "@/components/icons/Icon";
import type { ComponentType } from "react";

type IconCmp = ComponentType<IconProps>;

const ITEMS: { Icon: IconCmp; label: string }[] = [
  { Icon: ShieldIcon, label: "ID-verified sellers" },
  { Icon: ChatBubbleIcon, label: "Direct WhatsApp contact" },
  { Icon: TruckIcon, label: "16-region coverage" },
  { Icon: SeedlingIcon, label: "No middlemen, ever" },
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
              <Icon size={14} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
