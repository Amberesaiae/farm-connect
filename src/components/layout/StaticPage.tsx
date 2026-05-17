import type { ReactNode } from "react";
import { AppShell } from "./AppShell";

export function StaticPage({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-16">
        <header className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary">
            {eyebrow}
          </span>
          <h1 className="font-display mt-3 text-[34px] font-extrabold leading-[1.05] tracking-tight md:text-[46px]">
            {title}
          </h1>
          {lede ? (
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{lede}</p>
          ) : null}
        </header>
        <div className="prose-content mt-10 space-y-6 text-[14.5px] leading-relaxed text-foreground/90">
          {children}
        </div>
      </div>
    </AppShell>
  );
}