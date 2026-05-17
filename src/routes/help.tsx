import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/layout/StaticPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/faqs";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & FAQ — farmlink" },
      {
        name: "description",
        content: "Frequently asked questions about buying, selling, verification, and safety on farmlink.",
      },
      { property: "og:title", content: "Help & FAQ — farmlink" },
      { property: "og:description", content: "Answers to common questions about farmlink." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <StaticPage
      eyebrow="Help"
      title={<>Quick answers, <span className="text-primary">no run-around.</span></>}
      lede="Most questions land in one of these. Still stuck? The contact form is one tap away."
    >
      <Accordion type="single" collapsible className="rounded-2xl border-[1.5px] border-border bg-card">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="px-5">
            <AccordionTrigger className="text-left text-[14.5px] font-semibold text-foreground">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-[13.5px] leading-relaxed text-muted-foreground">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
        <p className="font-display text-[18px] font-extrabold tracking-tight">
          Didn't find what you needed?
        </p>
        <p className="mt-1 text-[13px] text-white/85">
          We reply within a working day.
        </p>
        <Link
          to="/contact"
          className="mt-3 inline-flex items-center rounded-md bg-white px-4 py-2 text-[12.5px] font-semibold text-primary hover:bg-white/90"
        >
          Contact us →
        </Link>
      </div>
    </StaticPage>
  );
}