import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Props = {
  /** Visible label for the action button */
  label?: string;
  /** Optional trailing slot, e.g. price */
  trailing?: React.ReactNode;
  className?: string;
} & (
  | { to: string; onClick?: never; disabled?: never; type?: never }
  | {
      to?: never;
      onClick?: () => void;
      disabled?: boolean;
      type?: "button" | "submit";
    }
);

/**
 * Sticky bottom CTA used by Cart / Checkout / Product / Receipt pages.
 * Stays inside the PhoneFrame flex column — no absolute positioning,
 * no overlap with the BottomTabBar.
 */
export function StickyCTA({ label = "Continue", trailing, className, ...rest }: Props) {
  const content = (
    <span className="flex w-full items-center justify-between gap-3">
      <span>{label}</span>
      {trailing != null && <span className="font-bold">{trailing}</span>}
    </span>
  );

  const base = cn(
    "flex w-full items-center justify-center rounded-full bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60",
    className,
  );

  return (
    <div className="sticky bottom-0 z-20 mt-auto border-t border-border/40 bg-gradient-to-t from-background via-background to-background/80 px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-4">
      {"to" in rest && rest.to ? (
        <Link to={rest.to} className={base}>
          {content}
        </Link>
      ) : (
        <button
          type={rest.type ?? "button"}
          onClick={rest.onClick}
          disabled={rest.disabled}
          className={base}
        >
          {content}
        </button>
      )}
    </div>
  );
}
