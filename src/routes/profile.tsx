import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Heart,
  ListOrdered,
  MapPin,
  Bell,
  HelpCircle,
  LogOut,
  Pencil,
} from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomTabBar } from "@/components/BottomTabBar";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Agri Farming" },
      { name: "description", content: "Manage your profile, orders and preferences." },
      { property: "og:title", content: "Profile — Agri Farming" },
      { property: "og:description", content: "Your account, orders and saved items." },
    ],
  }),
  component: Profile,
});

const items = [
  { to: "/orders", icon: ListOrdered, label: "My Orders" },
  { to: "/favorites", icon: Heart, label: "My Favorites" },
  { to: "/shop", icon: MapPin, label: "Delivery Address" },
  { to: "/", icon: Bell, label: "Notifications" },
  { to: "/", icon: HelpCircle, label: "Help & Support" },
] as const;

function Profile() {
  return (
    <PhoneFrame withBottomNav>
      <header className="px-5 pt-6">
        <h1 className="text-center text-base font-semibold tracking-tight">Profile</h1>
      </header>

      <div className="mt-5 px-5">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=200&q=80"
              alt="Sarah's avatar"
              className="h-24 w-24 rounded-full object-cover ring-4 ring-primary-soft"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
              aria-label="Edit avatar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-base font-semibold">Sarah Whitfield</p>
          <p className="text-xs text-muted-foreground">sarah@agrifarming.app</p>
        </div>
      </div>

      <section className="mt-6 px-5">
        <ul className="overflow-hidden rounded-2xl bg-surface-2/70">
          {items.map((it, i) => (
            <li key={i}>
              <Link
                to={it.to}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <it.icon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-medium">{it.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              {i < items.length - 1 && <div className="ml-16 border-t border-border" />}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-5 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </section>

      <BottomTabBar />
    </PhoneFrame>
  );
}
