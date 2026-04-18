import type { ReactNode } from "react";

export function StickyContactBar({ children }: { children: ReactNode }) {
  return (
    <div
      className="fixed inset-x-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur md:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 64px)" }}
    >
      <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3">{children}</div>
    </div>
  );
}
