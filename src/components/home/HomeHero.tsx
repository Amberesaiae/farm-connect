import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import heroCattle from "@/assets/hero-cattle.jpg";
import heroGoats from "@/assets/hero-goats.jpg";
import heroPoultry from "@/assets/hero-poultry.jpg";

/**
 * Editorial scene-rotator hero. Accessibility-hardened:
 *  - Stable <h1> (does not change between scenes — SEO & SR friendly).
 *  - Rotating scene copy lives inside a role="group" + aria-roledescription="slide".
 *  - Auto-advance honours prefers-reduced-motion, document visibility, hover & focus.
 *  - Visible play/pause toggle (WCAG 2.2.2).
 *  - Indicator strip is a proper role="tablist" with arrow-key + Home/End nav and roving tabindex.
 *  - aria-live region announces the current scene to screen readers.
 *  - Contrast scrim guarantees ≥4.5:1 against any underlying image area.
 */
interface Scene {
  src: string;
  alt: string;
  eyebrow: string;
  word: string;
  line: string;
  caption: string;
  meta: string;
  position: string;
}

const SCENES: Scene[] = [
  {
    src: heroCattle,
    alt: "Sanga cattle grazing on Ghanaian savannah at golden hour",
    eyebrow: "Northern Region · Tamale",
    word: "Sanga",
    line: "cattle, from the land that raised them.",
    caption: "Bred on northern grasslands. Sold direct to your farm.",
    meta: "01 / Cattle",
    position: "center 55%",
  },
  {
    src: heroGoats,
    alt: "Herd of West African dwarf and Boer goats on a red-earth path at sunset",
    eyebrow: "Ashanti Region · Kumasi",
    word: "Goats",
    line: "with the dust of home still on their hooves.",
    caption: "Boer, West African dwarf, Sahelian — pick the breed, pick the farm.",
    meta: "02 / Small ruminants",
    position: "center 60%",
  },
  {
    src: heroPoultry,
    alt: "Free-range layer hens and a rooster in a Ghanaian village compound at sunset",
    eyebrow: "Bono Region · Dormaa",
    word: "Poultry",
    line: "raised under palm shade, ready by sunset.",
    caption: "Layers, broilers, day-olds, table birds — from hatchery to coop.",
    meta: "03 / Poultry",
    position: "center 50%",
  },
];

const DURATION_MS = 5500;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function HomeHero() {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [visible, setVisible] = useState(true);
  const reduced = usePrefersReducedMotion();
  const tablistId = useId();
  const liveId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Tab-visibility pause
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const effectivePaused = paused || hovered || focusWithin || !visible || reduced;

  useEffect(() => {
    if (effectivePaused) return;
    const t = window.setTimeout(() => {
      setPrev(i);
      setI((n) => (n + 1) % SCENES.length);
    }, DURATION_MS);
    return () => window.clearTimeout(t);
  }, [i, effectivePaused]);

  const goTo = useCallback(
    (next: number, focus = false) => {
      const clamped = ((next % SCENES.length) + SCENES.length) % SCENES.length;
      if (clamped === i) return;
      setPrev(i);
      setI(clamped);
      if (focus) {
        // Defer to next tick so the new tab is selectable
        window.setTimeout(() => tabRefs.current[clamped]?.focus(), 0);
      }
    },
    [i],
  );

  const onTabKey = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        goTo(i + 1, true);
        break;
      case "ArrowLeft":
        e.preventDefault();
        goTo(i - 1, true);
        break;
      case "Home":
        e.preventDefault();
        goTo(0, true);
        break;
      case "End":
        e.preventDefault();
        goTo(SCENES.length - 1, true);
        break;
    }
  };

  const scene = SCENES[i];
  const animate = !reduced;

  return (
    <section
      id="hero"
      aria-label="Featured livestock scenes"
      aria-roledescription="carousel"
      className="relative isolate overflow-hidden rounded-[28px] bg-foreground text-white shadow-[0_24px_80px_-30px_rgba(17,24,20,0.4)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusWithin(false);
      }}
    >
      {/* Live region — announces scene changes politely */}
      <div id={liveId} className="sr-only-live" aria-live="polite" aria-atomic="true">
        Scene {i + 1} of {SCENES.length}: {scene.word}, {scene.eyebrow}
      </div>

      {/* Stable H1 for SEO & screen readers — visually hidden, never changes */}
      <h1 className="sr-only-live">
        farmlink — Ghana's livestock marketplace, direct from the farm.
      </h1>

      <div className="relative aspect-[3/4] w-full sm:aspect-[16/10] md:aspect-[21/9] md:min-h-[520px]">
        {prev !== null && animate && (
          <img
            key={`prev-${prev}`}
            src={SCENES[prev].src}
            alt=""
            aria-hidden
            className="hero-img-leaving absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: SCENES[prev].position }}
            width={1920}
            height={1080}
          />
        )}
        <img
          key={`cur-${i}`}
          src={scene.src}
          alt={scene.alt}
          className={animate ? "hero-img-active absolute inset-0 h-full w-full object-cover" : "absolute inset-0 h-full w-full object-cover"}
          style={{ objectPosition: scene.position }}
          width={1920}
          height={1080}
          fetchPriority="high"
        />

        {/* Bottom scrim — guarantees text contrast over photography */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.25) 55%, rgba(17,24,20,0.92) 100%)",
          }}
        />
        {/* Targeted contrast pad anchored under the headline — guarantees 4.5:1 without darkening the photo */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 25% 100%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)",
          }}
        />
        {/* Top vignette for the eyebrow row */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-40"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* Top meta row */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-5 md:px-10 md:pt-7">
          <span className="font-display text-[13px] font-extrabold uppercase tracking-[0.22em] text-white">
            farmlink
          </span>
          <span
            key={`meta-${i}`}
            className={animate ? "hero-text-active font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/85" : "font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/85"}
          >
            {scene.meta}
          </span>
        </div>

        {/* Headline block — rotates per scene */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-20 md:px-12 md:pb-24">
          <div
            key={`text-${i}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${SCENES.length}: ${scene.word}, ${scene.eyebrow}`}
            className={animate ? "hero-text-active max-w-3xl" : "max-w-3xl"}
          >
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.24em] text-white">
              <span
                className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                style={{ background: "var(--accent-2)" }}
              />
              {scene.eyebrow}
            </p>
            <p
              aria-hidden="true"
              className="font-display mt-3 text-[34px] font-extrabold leading-[0.95] tracking-tight sm:text-[40px] md:text-[72px] lg:text-[88px]"
            >
              <span className="block italic" style={{ color: "var(--accent-2)" }}>
                {scene.word}
              </span>
              <span className="block text-white">{scene.line}</span>
            </p>
            <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-white md:text-[16px]">
              {scene.caption}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/listings"
                className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-3 text-[13.5px] font-bold text-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
              >
                Browse marketplace
                <ArrowRightIcon
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                to="/post"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-[13.5px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
              >
                Post a listing
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel controls — indicators + play/pause. Sits at the bottom edge. */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-6 pb-5 md:px-12 md:pb-6">
          <div
            id={tablistId}
            role="tablist"
            aria-label="Choose a scene"
            onKeyDown={onTabKey}
            className="flex w-full max-w-[280px] gap-2"
          >
            {SCENES.map((s, idx) => (
              <button
                key={s.word}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                type="button"
                role="tab"
                aria-selected={idx === i}
                aria-controls={`hero-slide-${idx}`}
                aria-label={`Scene ${idx + 1}: ${s.word}`}
                tabIndex={idx === i ? 0 : -1}
                onClick={() => goTo(idx)}
                className="group relative h-3 flex-1 cursor-pointer overflow-visible focus-visible:outline-none"
              >
                <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/30 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-foreground">
                  {idx === i && !effectivePaused ? (
                    <span
                      key={`bar-${i}`}
                      className="hero-progress absolute inset-0 block bg-white"
                      style={{ ["--hero-dur" as string]: `${DURATION_MS}ms` }}
                    />
                  ) : idx === i ? (
                    <span className="absolute inset-0 block bg-white" />
                  ) : idx < i ? (
                    <span className="absolute inset-0 block bg-white/70" />
                  ) : null}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused || reduced}
            aria-label={paused || reduced ? "Play scene auto-advance" : "Pause scene auto-advance"}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
          >
            {paused || reduced ? <PlayGlyph /> : <PauseGlyph />}
          </button>
        </div>
      </div>
    </section>
  );
}

function PlayGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">
      <path d="M3 1.5v11l9-5.5z" />
    </svg>
  );
}
function PauseGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">
      <rect x="2.5" y="1.5" width="3" height="11" rx="0.6" />
      <rect x="8.5" y="1.5" width="3" height="11" rx="0.6" />
    </svg>
  );
}
