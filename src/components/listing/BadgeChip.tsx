import { Badge } from "@/components/ui/badge";
import { ShieldIcon, VerifiedBadgeIcon, SparkleIcon } from "@/components/icons";
import type { IconProps } from "@/components/icons/Icon";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

interface BadgeChipProps {
  tier: "none" | "verified" | "trusted" | "top_seller" | string | null | undefined;
  className?: string;
}

type IconCmp = ComponentType<IconProps>;

export function BadgeChip({ tier, className }: BadgeChipProps) {
  if (!tier || tier === "none") return null;
  const config: Record<string, { label: string; icon: IconCmp; cls: string }> = {
    verified: {
      label: "Verified",
      icon: ShieldIcon,
      cls: "bg-primary-soft text-primary border-primary/20",
    },
    trusted: {
      label: "Trusted",
      icon: VerifiedBadgeIcon,
      cls: "bg-secondary/20 text-secondary-foreground border-secondary/30",
    },
    top_seller: {
      label: "Top seller",
      icon: SparkleIcon,
      cls: "bg-warning/20 text-warning-foreground border-warning/30",
    },
  };
  const c = config[tier];
  if (!c) return null;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", c.cls, className)}>
      <Icon size={12} />
      {c.label}
    </Badge>
  );
}
