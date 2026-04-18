import { Link, useLocation } from "@tanstack/react-router";
import { Bookmark, Plus, Search, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const accountTo = isAuthenticated ? "/dashboard" : "/login";

  const isActive = (to: string) =>
    to === "/listings"
      ? location.pathname === "/" || location.pathname.startsWith("/listings")
      : location.pathname.startsWith(to);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 items-end px-2">
        <TabItem to="/listings" label="Browse" Icon={Search} active={isActive("/listings")} />
        <TabItem to="/saved" label="Saved" Icon={Bookmark} active={isActive("/saved")} />
        <li className="flex justify-center">
          <Link
            to="/post"
            aria-label="Post a listing"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </li>
        <TabItem to={accountTo} label="Account" Icon={User} active={isActive("/dashboard") || isActive("/login")} />
      </ul>
    </nav>
  );
}

function TabItem({
  to,
  label,
  Icon,
  active,
}: {
  to: "/listings" | "/saved" | "/dashboard" | "/login";
  label: string;
  Icon: typeof Search;
  active: boolean;
}) {
  return (
    <li>
      <Link
        to={to}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        <span
          className={cn(
            "flex h-9 min-w-[2.25rem] items-center justify-center rounded-full px-3 transition-colors",
            active && "bg-primary-soft",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span>{label}</span>
      </Link>
    </li>
  );
}
