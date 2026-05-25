const ITEMS = [
  "ID-verified sellers",
  "Direct WhatsApp",
  "16 regions covered",
  "No middlemen, ever",
  "Verified hatcheries",
  "Fresh from the farm",
  "Report any listing in 24h",
];

/**
 * Single-line marquee ticker replacing the static announcement bar.
 * Uses the .ticker-track CSS keyframes; pauses on hover and respects
 * prefers-reduced-motion (see styles.css).
 */
export function AgoraTicker() {
  const row = (
    <ul className="flex shrink-0 items-center gap-8 px-4">
      {ITEMS.map((t, i) => (
        <li
          key={`${i}-${t}`}
          className="inline-flex items-center gap-2 whitespace-nowrap text-[12px] font-semibold tracking-wide text-primary-foreground"
        >
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
          {t}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="relative flex items-center overflow-hidden bg-primary py-2"
      role="region"
      aria-label="Marketplace highlights"
    >
      <div className="ticker-track flex w-max items-center">
        {row}
        {/* duplicate row for seamless loop */}
        <div aria-hidden>{row}</div>
      </div>
      {/* subtle edge fade */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-primary to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-primary to-transparent"
      />
    </div>
  );
}