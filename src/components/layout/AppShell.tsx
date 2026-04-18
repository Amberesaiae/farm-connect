import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { MobileTabBar } from "./MobileTabBar";
import { AnnouncementBar } from "./AnnouncementBar";
import { PriceTicker } from "./PriceTicker";

export function AppShell({
  children,
  showTicker = true,
}: {
  children: ReactNode;
  showTicker?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <TopNav />
      {showTicker ? <PriceTicker /> : null}
      <main className="flex-1 pb-24 md:pb-12">{children}</main>
      <MobileTabBar />
    </div>
  );
}
