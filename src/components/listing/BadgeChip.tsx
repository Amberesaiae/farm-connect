import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeChipProps {
  tier: "none" | "verified" | "trusted" | "top_seller" | string | null | undefined;
  className?: string;
}

export function BadgeChip({ tier, className }: BadgeChipProps) {
  if (!tier || tier === "none") return null;
  const config: Record<string, { label: string; icon: typeof ShieldCheck; cls: string }> = {
    verified: {
      label: "Verified",
      icon: ShieldCheck,
      cls: "bg-primary-soft text-primary border-primary/20",
    },
    trusted: {
      label: "Trusted",
      icon: Award,
      cls: "bg-secondary/20 text-secondary-foreground border-secondary/30",
    },
    top_seller: {
      label: "Top seller",
      icon: Star,
      cls: "bg-warning/20 text-warning-foreground border-warning/30",
    },
  };
  const c = config[tier];
  if (!c) return null;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", c.cls, className)}>
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  );
}
