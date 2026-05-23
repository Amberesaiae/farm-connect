import type { ReactNode } from "react";
import { AppShell } from "./AppShell";
import { PageHero } from "@/components/shared/PageHero";

export function StaticPage({
  eyebrow,
  title,
  lede,
  image,
  imageAlt,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  image?: string;
  imageAlt?: string;
  children: ReactNode;
}) {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <PageHero
          eyebrow={eyebrow}
          title={title}
          lede={lede}
          image={image}
          imageAlt={imageAlt}
        />
        <div className="prose-content mx-auto mt-10 max-w-3xl space-y-6 text-[14.5px] leading-relaxed text-foreground/90 md:mt-14">
          {children}
        </div>
      </div>
    </AppShell>
  );
}