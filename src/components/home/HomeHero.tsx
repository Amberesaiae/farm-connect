import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import heroCattle from "@/assets/hero-cattle.jpg";
import heroGoats from "@/assets/hero-goats.jpg";
import heroPoultry from "@/assets/hero-poultry.jpg";

/**
 * Editorial scene-rotator hero. No search box, no green wash — image leads.
 * A subtle bottom-anchored dark gradient keeps text legible while letting the
 * photography (golden hour, red earth, dust) carry the brand mood.
 *
 * Each scene rotates every 5.5s; headline slides in with a clip-path reveal
 * so the kinetic motion comes from the type, not the image.
 */
interface Scene {
  src: string;
  alt: string;
  eyebrow: string;
  word: string;        // accent word — large, in clay tone
  line: string;        // continuation of the headline
  caption: string;     // sub-line under the headline
  meta: string;        // tiny dateline / location credit
  position: string;    // background-position to keep the subject in frame
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

export function HomeHero() {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setPrev(i);
      setI((n) => (n + 1) % SCENES.length);
    }, DURATION_MS);
    return () => clearInterval(t);
  }, [i]);

  const goTo = (next: number) => {
    if (next === i) return;
    setPrev(i);
    setI(next);
  };

  const scene = SCENES[i];

  return (
    <section
      aria-label="Featured livestock"
      className="relative isolate overflow-hidden rounded-[28px] bg-foreground text-white shadow-[0_24px_80px_-30px_rgba(17,24,20,0.4)]"
    >
      {/* Image stage */}
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/10] md:aspect-[21/9] md:min-h-[520px]">
        {/* Outgoing image (briefly held under the incoming one) */}
        {prev !== null && (
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
          className="hero-img-active absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: scene.position }}
          width={1920}
          height={1080}
          fetchPriority="high"
        />

        {/* Legibility scrim — bottom-anchored dark wash, NO green overlay.
            Stronger on mobile (text wraps tighter), softer on desktop. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.15) 55%, rgba(17,24,20,0.85) 100%)",
          }}
        />
        {/* Subtle left vignette for extra contrast under the eyebrow */}
        <div
          aria-hidden
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0) 60%)",
          }}
        />

        {/* Top meta row — brand mark + scene counter */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-5 md:px-10 md:pt-7">
          <span className="font-display text-[13px] font-extrabold uppercase tracking-[0.22em] text-white/85">
            farmlink
          </span>
          <span
            key={`meta-${i}`}
            className="hero-text-active font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/70"
          >
            {scene.meta}
          </span>
        </div>

        {/* Headline block — anchored bottom-left, slides on each scene change */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-10 md:px-12 md:pb-14">
          <div key={`text-${i}`} className="hero-text-active max-w-3xl">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.24em] text-white/75">
              <span
                className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                style={{ background: "var(--accent-2)" }}
              />
              {scene.eyebrow}
            </p>
            <h1 className="font-display mt-3 text-[40px] font-extrabold leading-[0.95] tracking-tight md:text-[72px] lg:text-[88px]">
              <span
                className="block italic"
                style={{ color: "var(--accent-2)" }}
              >
                {scene.word}
              </span>
              <span className="block text-white">{scene.line}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-white/85 md:text-[16px]">
              {scene.caption}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/listings"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[13.5px] font-bold text-foreground transition-transform hover:-translate-y-0.5"
              >
                Browse marketplace
                <ArrowRightIcon
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                to="/post"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-[13.5px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                Post a listing
              </Link>
            </div>
          </div>
        </div>

        {/* Scene indicators — clickable progress bars */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 px-6 md:bottom-5 md:px-12">
          <div className="flex w-full max-w-[260px] gap-2">
            {SCENES.map((s, idx) => (
              <button
                key={s.word}
                type="button"
                onClick={() => goTo(idx)}
                aria-label={`Show ${s.word} scene`}
                className="group relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/25"
              >
                {idx === i ? (
                  <span
                    key={`bar-${i}`}
                    className="hero-progress absolute inset-0 block bg-white"
                    style={{ ["--hero-dur" as string]: `${DURATION_MS}ms` }}
                  />
                ) : idx < i ? (
                  <span className="absolute inset-0 block bg-white/70" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}