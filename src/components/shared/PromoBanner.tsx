import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const TONE = {
  mint: "bg-surface-mint",
  peach: "bg-surface-peach",
  butter: "bg-surface-butter",
  cream: "bg-surface-cream",
} as const;

export function PromoBanner({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  cta,
  tone = "mint",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  image: string;
  imageAlt: string;
  cta: { to: string; label: string };
  tone?: keyof typeof TONE;
}) {
  return (
    <article
      className={cn(
        "group grid overflow-hidden rounded-3xl border border-border md:grid-cols-2",
        TONE[tone],
      )}
    >
      <div className="flex flex-col gap-4 p-6 md:p-8">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-foreground/70">
          {eyebrow}
        </p>
        <h3 className="font-display text-[24px] font-extrabold leading-[1.05] tracking-tight text-foreground md:text-[30px]">
          {title}
        </h3>
        <p className="text-[13.5px] leading-relaxed text-foreground/75 md:text-[14.5px]">
          {description}
        </p>
        <Link
          to={cta.to as never}
          className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-3 text-[13px] font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {cta.label}
          <ArrowRightIcon size={14} />
        </Link>
      </div>
      <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          width={1280}
          height={896}
          className="h-full w-full object-cover"
        />
      </div>
    </article>
  );
}