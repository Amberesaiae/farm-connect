import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/layout/StaticPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — farmlink" },
      { name: "description", content: "How farmlink collects, uses and protects your data." },
      { property: "og:title", content: "Privacy policy — farmlink" },
      { property: "og:description", content: "Our plain-English privacy commitments." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <StaticPage
      eyebrow="Privacy"
      title={<>Your data, <span className="text-primary">straight up.</span></>}
      lede="We collect the minimum we need to keep the marketplace safe and useful. No selling your data, no shady tracking."
    >
      <Section title="What we collect">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Account basics: your name, phone number and (optionally) email.</li>
          <li>Verification documents (Ghana Card, selfie) — encrypted and only seen by our reviewers.</li>
          <li>Listing content you publish and messages you send through the platform.</li>
          <li>Standard logs: device type, region and timestamps to keep things secure.</li>
        </ul>
      </Section>
      <Section title="How we use it">
        <p>
          To run the marketplace — show your listings to buyers, route WhatsApp chats,
          prevent fraud, and improve the product. We never sell your data to third
          parties.
        </p>
      </Section>
      <Section title="Who can see what">
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Your public profile name, region and verified badge are visible to all visitors.</li>
          <li>Your WhatsApp number is only revealed when a verified buyer taps "Contact seller".</li>
          <li>Verification documents are visible only to our admins for review.</li>
        </ul>
      </Section>
      <Section title="Your rights">
        <p>
          You can edit your profile, delete your listings, or request full account
          deletion at any time by emailing{" "}
          <a className="text-primary underline" href="mailto:privacy@farmlink.app">privacy@farmlink.app</a>.
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