import { Link, useLocation } from "@tanstack/react-router";
import { Bookmark, LayoutGrid, Plus, Search, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface Tab {
  to: "/listings" | "/saved" | "/post" | "/dashboard" | "/login";
  label: string;
  icon: typeof Search;
  primary?: boolean;
}

export function MobileTabBar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const tabs: Tab[] = [
    { to: "/listings", label: "Browse", icon: Search },
    { to: "/saved", label: "Saved", icon: Bookmark },
    { to: "/post", label: "Post", icon: Plus, primary: true },
    {
      to: isAuthenticated ? "/dashboard" : "/login",
      label: isAuthenticated ? "Mine" : "Sign in",
      icon: isAuthenticated ? LayoutGrid : User,
    },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((t) => {
          const isActive =
            location.pathname === t.to ||
            (t.to !== "/listings" && location.pathname.startsWith(t.to));
          const Icon = t.icon;
          return (
            <li key={t.to} className="flex-1">
              <Link
                to={t.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                    t.primary && "bg-primary text-primary-foreground",
                    !t.primary && isActive && "bg-primary-soft text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
