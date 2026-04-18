import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { MobileTabBar } from "./MobileTabBar";
import { AnnouncementBar } from "./AnnouncementBar";
import { TrustBanner } from "./TrustBanner";
import { Footer } from "./Footer";

export function AppShell({
  children,
  showTrust = false,
}: {
  children: ReactNode;
  showTrust?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <TopNav />
      {showTrust ? <TrustBanner /> : null}
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
