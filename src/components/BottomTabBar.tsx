import { Link, useLocation } from "@tanstack/react-router";
import { Home, Store, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart, selectCartCount } from "@/stores/cart-store";

type Tab = {
  to: "/" | "/shop" | "/cart" | "/profile";
  label: string;
  icon: typeof Home;
};

const TABS: Tab[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/shop", label: "Shop", icon: Store },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomTabBar() {
  const { pathname } = useLocation();
  const count = useCart(selectCartCount);

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 left-0 right-0 z-40 mt-auto border-t border-border/60 bg-background/95 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-[420px] items-center justify-between">
        {TABS.map((t) => {
          const active = pathname === t.to;
          const Icon = t.icon;
          return (
            <li key={t.to} className="flex-1">
              <Link
                to={t.to}
                aria-current={active ? "page" : undefined}
                aria-label={t.label}
                className={cn(
                  "group relative mx-auto flex flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-2 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative">
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={active ? 2.4 : 2}
                    aria-hidden
                  />
                  {t.to === "/cart" && count > 0 && (
                    <span
                      aria-label={`${count} items in cart`}
                      className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground"
                    >
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </span>
                <span className="leading-none">{t.label}</span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute -top-2 h-1 w-6 rounded-full bg-primary"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
