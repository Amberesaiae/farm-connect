import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/layout/StaticPage";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety guide — farmlink" },
      {
        name: "description",
        content: "How to buy and sell livestock safely on farmlink. Red flags, inspection tips, and how to report fraud.",
      },
      { property: "og:title", content: "Safety guide — farmlink" },
      { property: "og:description", content: "Buyer and seller safety checklist for livestock trades in Ghana." },
    ],
  }),
  component: SafetyPage,
});

function SafetyPage() {
  return (
    <StaticPage
      eyebrow="Safety"
      title={<>Trade <span className="text-primary">smart, trade safe.</span></>}
      lede="farmlink connects you directly with the other party. That means trust matters. Here's how to stay on the right side of every deal."
    >
      <section>
        <h2 className="font-display text-[20px] font-extrabold tracking-tight text-foreground">
          For buyers
        </h2>
        <ul className="mt-2 ml-5 list-disc space-y-1.5 text-muted-foreground">
          <li>Always inspect the animal in person — or send a trusted rep — before paying.</li>
          <li>Pay only at handover. Mobile money is fine; avoid sending the full amount upfront to a stranger.</li>
          <li>Prefer sellers with the green verified ID badge.</li>
          <li>For high-value purchases, ask a vet from <Link to="/services" className="text-primary underline">our services directory</Link> to do a pre-purchase check.</li>
        </ul>
      </section>
      <section>
        <h2 className="font-display text-[20px] font-extrabold tracking-tight text-foreground">
          For sellers
        </h2>
        <ul className="mt-2 ml-5 list-disc space-y-1.5 text-muted-foreground">
          <li>Never release the animal before payment clears.</li>
          <li>Beware of "I'll send my agent to pay" buyers — meet face to face.</li>
          <li>Don't share your bank PIN or OTP, ever. farmlink will never ask for it.</li>
          <li>Keep WhatsApp chats civil — they may be reviewed if a dispute is reported.</li>
        </ul>
      </section>
      <section>
        <h2 className="font-display text-[20px] font-extrabold tracking-tight text-foreground">
          Red flags 🚩
        </h2>
        <ul className="mt-2 ml-5 list-disc space-y-1.5 text-muted-foreground">
          <li>Prices much lower than market average.</li>
          <li>Seller refuses to meet or share location.</li>
          <li>Pressure to "pay now or lose it".</li>
          <li>Requests for OTPs, bank details, or unusual payment apps.</li>
        </ul>
      </section>
      <section className="rounded-2xl bg-primary-soft p-5">
        <h2 className="font-display text-[18px] font-extrabold tracking-tight text-primary">
          See something off? Report it.
        </h2>
        <p className="mt-1 text-[13.5px] text-primary/90">
          Tap "Report" on any listing, or write to us directly.
        </p>
        <Link
          to="/contact"
          search={{ topic: "report" }}
          className="mt-3 inline-flex items-center rounded-md bg-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Report an issue →
        </Link>
      </section>
    </StaticPage>
  );
}