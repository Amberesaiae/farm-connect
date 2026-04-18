import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  /** Tailwind text size class. Defaults to text-[20px]. */
  size?: string;
  /** Render as a Link to "/" when true (default). */
  asLink?: boolean;
  className?: string;
}

/**
 * Plain lowercase "farmlink" wordmark — no icon, no emoji, no colored span.
 * Used everywhere in place of icon+text combos for a single, calm brand voice.
 */
export function Wordmark({
  size = "text-[20px]",
  asLink = true,
  className,
}: WordmarkProps) {
  const inner = (
    <span
      className={cn(
        "font-display font-extrabold tracking-tight text-foreground",
        size,
        className,
      )}
    >
      farmlink
    </span>
  );
  if (!asLink) return inner;
  return (
    <Link to="/" className="inline-flex items-center" aria-label="farmlink home">
      {inner}
    </Link>
  );
}
