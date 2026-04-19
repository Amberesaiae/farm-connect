import { forwardRef, type SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Farmlink high-end SVG icon system.
 *
 * Hand-tuned, geometrically precise icons drawn on a 24x24 grid with a
 * 1.6px stroke and rounded joins to match the v2 brand: warm cream canvas,
 * forest green primary, generous radii. Every icon is purpose-drawn for
 * Farmlink — not a generic UI set.
 *
 * Add new glyphs by exporting a forwardRef component that wraps <Icon>
 * and provides the path/shape children. Keep paths under ~6 commands and
 * favour straight strokes + arcs over fussy detail.
 */

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { size = 20, strokeWidth = 1.6, className, children, ...rest },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      {...rest}
    >
      {children}
    </svg>
  );
});
