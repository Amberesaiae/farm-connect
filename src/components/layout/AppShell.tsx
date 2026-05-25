import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { MobileTabBar } from "./MobileTabBar";
import { AgoraTicker } from "./AgoraTicker";
import { Footer } from "./Footer";

export function AppShell({
  children,
}: {
  children: ReactNode;
  /** @deprecated Trust is now carried by the ticker; this prop is a no-op. */
  showTrust?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AgoraTicker />
      <TopNav />
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to content
      </a>
      <main
        id="content"
        tabIndex={-1}
        className="flex-1 pb-[calc(env(safe-area-inset-bottom)+88px)] md:pb-0"
      >
        {children}
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
