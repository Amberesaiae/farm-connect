import { Link, useLocation } from "@tanstack/react-router";
import { Home, Store, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/shop", label: "Shop", icon: Store },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomTabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-3 sm:absolute">
      <div className="pointer-events-auto mx-3 flex w-full max-w-[416px] items-center justify-between rounded-full border border-border/60 bg-background/95 px-3 py-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] backdrop-blur">
        {tabs.map((t) => {
          const active = pathname === t.to;
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-3 py-2 text-[11px] font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={t.label}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              <span className={cn("leading-none", active ? "block" : "hidden")}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
