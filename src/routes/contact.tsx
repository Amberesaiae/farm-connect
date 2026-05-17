import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GHANA_REGIONS } from "@/lib/constants";
import { submitContact } from "@/lib/contact.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact farmlink — get in touch" },
      {
        name: "description",
        content:
          "Reach the farmlink team — questions, partnerships, reports, or press. We reply within a working day.",
      },
      { property: "og:title", content: "Contact farmlink" },
      {
        property: "og:description",
        content: "Questions, partnerships, or reports — get in touch with farmlink.",
      },
    ],
  }),
  component: ContactPage,
  validateSearch: (s: Record<string, unknown>) => ({
    topic: typeof s.topic === "string" ? s.topic : undefined,
  }),
});

const TOPICS = [
  { value: "general", label: "General question" },
  { value: "report", label: "Report a listing or user" },
  { value: "partnership", label: "Partnership / supplier" },
  { value: "press", label: "Press & media" },
  { value: "bug", label: "Bug or technical issue" },
  { value: "account", label: "My account" },
];

function ContactPage() {
  const { topic: presetTopic } = Route.useSearch();
  const send = useServerFn(submitContact);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    region: "",
    topic: TOPICS.some((t) => t.value === presetTopic) ? (presetTopic as string) : "general",
    message: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await send({ data: form });
      setDone(true);
      toast.success("Message sent — we'll be in touch shortly.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send your message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
        <header className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary">
            Contact
          </span>
          <h1 className="font-display mt-3 text-[34px] font-extrabold leading-[1.05] tracking-tight md:text-[46px]">
            Talk to a real human.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Question, report, partnership idea or press enquiry — drop us a line and
            we'll reply within a working day.
          </p>
        </header>

        <div className="mt-10 grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <section
            aria-labelledby="contact-form-heading"
            className="rounded-3xl border-[1.5px] border-border bg-card p-6 md:p-8"
          >
            <h2 id="contact-form-heading" className="font-display text-[20px] font-extrabold tracking-tight">
              Send a message
            </h2>

            {done ? (
              <div className="mt-6 rounded-2xl bg-primary-soft p-5 text-primary">
                <p className="font-display text-[18px] font-extrabold">Got it ✓</p>
                <p className="mt-1 text-[13.5px] text-primary/90">
                  Thanks, {form.name}. We'll get back to you shortly.
                </p>
                <div className="mt-4">
                  <Link to="/" className="text-[12.5px] font-semibold text-primary hover:underline">
                    ← Back to home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">Your name</Label>
                    <Input
                      id="contact-name"
                      required
                      maxLength={80}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">Email (optional)</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      maxLength={160}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-topic">Topic</Label>
                    <Select
                      value={form.topic}
                      onValueChange={(v) => setForm({ ...form, topic: v })}
                    >
                      <SelectTrigger id="contact-topic">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TOPICS.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-region">Region (optional)</Label>
                    <Select
                      value={form.region}
                      onValueChange={(v) => setForm({ ...form, region: v })}
                    >
                      <SelectTrigger id="contact-region">
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                      <SelectContent>
                        {GHANA_REGIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what's on your mind…"
                  />
                  <p className="text-[11.5px] text-muted-foreground">
                    {form.message.length}/2000
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Sending…" : "Send message"}
                  </Button>
                  <p className="text-[11.5px] text-muted-foreground">
                    By sending you agree to our{" "}
                    <Link to="/privacy" className="underline">privacy policy</Link>.
                  </p>
                </div>
              </form>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border-[1.5px] border-border bg-card p-6">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                WhatsApp
              </p>
              <a
                href="https://wa.me/233000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display mt-2 block text-[20px] font-extrabold tracking-tight text-primary hover:underline"
              >
                +233 00 000 0000
              </a>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Fastest channel · Mon–Sat, 8am–6pm GMT.
              </p>
            </div>
            <div className="rounded-3xl border-[1.5px] border-border bg-card p-6">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Email
              </p>
              <a
                href="mailto:hello@farmlink.app"
                className="font-display mt-2 block text-[18px] font-extrabold tracking-tight text-foreground hover:text-primary"
              >
                hello@farmlink.app
              </a>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Reply within 1 working day.
              </p>
            </div>
            <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
              <p className="font-display text-[18px] font-extrabold tracking-tight">
                Looking for help?
              </p>
              <p className="mt-1 text-[13px] text-white/85">
                Most questions are already answered.
              </p>
              <Link
                to="/help"
                className="mt-3 inline-flex items-center rounded-md bg-white px-4 py-2 text-[12.5px] font-semibold text-primary hover:bg-white/90"
              >
                Browse FAQ →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}