import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/layout/StaticPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of use — farmlink" },
      { name: "description", content: "The rules of using the farmlink marketplace." },
      { property: "og:title", content: "Terms of use — farmlink" },
      { property: "og:description", content: "Plain-English rules for buyers, sellers and providers." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <StaticPage
      eyebrow="Terms"
      title={<>The <span className="text-primary">house rules.</span></>}
      lede="By using farmlink you agree to these terms. They exist to keep trades fair and the community safe."
    >
      <Section title="The marketplace">
        <p>
          farmlink is a directory and contact platform. We don't take a cut of trades
          and we don't hold buyer payments. All money and goods change hands directly
          between the parties.
        </p>
      </Section>
      <Section title="Sellers must">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>List only animals or products they personally own and can deliver on.</li>
          <li>Post accurate prices, breeds, ages and health status.</li>
          <li>Honour quoted prices unless conditions clearly change.</li>
          <li>Comply with Ghana Veterinary Services rules for hatcheries and agro-meds.</li>
        </ul>
      </Section>
      <Section title="Buyers must">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Inspect animals before paying — or use a vet from our services directory.</li>
          <li>Pay agreed amounts promptly and never share OTPs or PINs.</li>
          <li>Report scams and broken listings via Contact us.</li>
        </ul>
      </Section>
      <Section title="Prohibited">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Endangered species, bushmeat, or untraceable wildlife.</li>
          <li>Counterfeit veterinary drugs or unapproved medications.</li>
          <li>Fake verification documents or impersonation.</li>
        </ul>
      </Section>
      <Section title="Account suspension">
        <p>
          We may suspend or remove accounts that break these rules, with or without
          notice depending on severity. Repeat offenders are banned and reported.
        </p>
      </Section>
      <p className="text-[12.5px] text-muted-foreground">Last updated: May 2026.</p>
    </StaticPage>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[20px] font-extrabold tracking-tight text-foreground">{title}</h2>
      <div className="mt-2 space-y-2 text-muted-foreground">{children}</div>
    </section>
  );
}