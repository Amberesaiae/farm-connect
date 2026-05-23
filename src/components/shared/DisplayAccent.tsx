import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Italicized green accent word used inside display headings.
 * Matches the Agora-style "Make healthy life with *fresh* grocery" treatment.
 */
export function DisplayAccent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("display-accent", className)}>{children}</span>;
}