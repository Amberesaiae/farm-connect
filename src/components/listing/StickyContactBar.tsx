import type { ReactNode } from "react";

/**
 * Mobile-only sticky action bar.
 * Sits above the MobileTabBar (which is 66px tall + safe-area).
 */
export function StickyContactBar({ children }: { children: ReactNode }) {
  return (
    <div
      className="fixed inset-x-0 z-30 border-t border-border bg-card/97 backdrop-blur md:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 66px)" }}
    >
      <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3">{children}</div>
    </div>
  );
}
