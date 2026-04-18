import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  withBottomNav?: boolean;
};

/**
 * Centers content in a phone-sized column with a soft device frame on desktop.
 * On mobile (<= 480px) it goes edge-to-edge.
 */
export function PhoneFrame({ children, className, withBottomNav = false }: Props) {
  return (
    <div className="min-h-screen w-full bg-surface">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-background sm:my-6 sm:min-h-0 sm:rounded-[2.25rem] sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] sm:ring-1 sm:ring-black/5 sm:overflow-hidden">
        <div
          className={cn(
            "flex min-h-screen flex-1 flex-col sm:min-h-[860px]",
            withBottomNav && "pb-24",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
