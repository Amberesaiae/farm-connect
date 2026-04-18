import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** @deprecated kept for backwards compat — BottomTabBar is now sticky in-flow */
  withBottomNav?: boolean;
};

/**
 * Centers content in a phone-sized column with a soft device frame on desktop.
 * Children render in a flex column so a child <BottomTabBar /> can use
 * `sticky bottom-0 mt-auto` to pin to the bottom of the viewport / frame.
 */
export function PhoneFrame({ children, className }: Props) {
  return (
    <div className="min-h-svh w-full bg-surface">
      <div className="relative mx-auto flex min-h-svh w-full max-w-[440px] flex-col bg-background sm:my-6 sm:min-h-[860px] sm:rounded-[2.25rem] sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] sm:ring-1 sm:ring-black/5 sm:overflow-hidden">
        <div className={cn("flex min-h-svh flex-1 flex-col sm:min-h-[860px]", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
