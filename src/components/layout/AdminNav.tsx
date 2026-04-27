import { Link, useLocation } from "@tanstack/react-router";
import { Flag, ScrollText } from "lucide-react";
import { ListingsIcon, ShieldIcon, UserIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/admin/verifications", label: "Verifications", Icon: ShieldIcon },
  { to: "/admin/hatcheries", label: "Hatcheries", Icon: ShieldIcon },
  { to: "/admin/stores", label: "Shops", Icon: ShieldIcon },
  { to: "/admin/listings", label: "Listings", Icon: ListingsIcon },
  { to: "/admin/reports", label: "Reports", Icon: Flag },
  { to: "/admin/users", label: "Users", Icon: UserIcon },
  { to: "/admin/taxonomy", label: "Taxonomy", Icon: ListingsIcon },
  { to: "/admin/audit", label: "Audit", Icon: ScrollText },
] as const;

export function AdminNav() {
  const location = useLocation();
  return (
    <nav
      aria-label="Admin sections"
      className="flex flex-wrap items-center gap-1.5 rounded-2xl border-[1.5px] border-border bg-card p-1.5"
    >
      {TABS.map((t) => {
        const active = location.pathname.startsWith(t.to);
        return (
          <Link
            key={t.to}
            to={t.to}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground",
            )}
          >
            <t.Icon size={14} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
