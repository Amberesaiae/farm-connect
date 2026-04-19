import { Link, useLocation } from "@tanstack/react-router";
import {
  BookmarkIcon,
  PlusIcon,
  UserIcon,
  HomeIcon,
  StorefrontIcon,
} from "@/components/icons";
import type { IconProps } from "@/components/icons/Icon";
import type { ComponentType } from "react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

type IconCmp = ComponentType<IconProps>;
type TabTo = "/listings" | "/saved" | "/dashboard" | "/login" | "/services";

export function MobileTabBar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const accountTo: TabTo = isAuthenticated ? "/dashboard" : "/login";

  const isBrowse =
    location.pathname === "/" ||
    (location.pathname.startsWith("/listings") && !location.pathname.startsWith("/listings/"));
  const isServices =
    location.pathname.startsWith("/services") || location.pathname.startsWith("/hatcheries");
  const isSaved = location.pathname.startsWith("/saved");
  const isAccount =
    location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/login");

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/97 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex h-[66px] max-w-md items-center px-1">
        <TabItem to="/listings" label="Browse" Icon={HomeIcon} active={isBrowse} />
        <TabItem to="/services" label="Services" Icon={StorefrontIcon} active={isServices} />
        <li className="flex shrink-0 justify-center">
          <Link
            to="/post"
            aria-label="Post a listing"
            className="-mt-2 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_16px_rgba(20,83,45,0.35)] transition-transform hover:scale-105 active:scale-95"
          >
            <PlusIcon size={22} strokeWidth={2} />
          </Link>
        </li>
        <TabItem to="/saved" label="Saved" Icon={BookmarkIcon} active={isSaved} />
        <TabItem to={accountTo} label="Account" Icon={UserIcon} active={isAccount} />
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
  to: TabTo;
  label: string;
  Icon: IconCmp;
  active: boolean;
}) {
  return (
    <li className="flex-1">
      <Link
        to={to}
        className={cn(
          "flex flex-col items-center justify-center gap-[3px] py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Icon size={22} strokeWidth={active ? 2 : 1.6} />
        <span>{label}</span>
      </Link>
    </li>
  );
}
