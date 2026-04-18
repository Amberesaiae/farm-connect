import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { submitVerification } from "@/server/verification.functions";
import { VERIFICATION_DOCS_BUCKET } from "@/lib/constants";
import { normaliseGhanaPhone } from "@/lib/format";
import { toast } from "sonner";
import { CheckCircle2, Clock, ImagePlus, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/verification")({
  head: () => ({ meta: [{ title: "Get verified — farmlink" }] }),
  component: VerificationPage,
});

interface Submission {
  id: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
}
interface Profile {
  display_name: string;
  whatsapp_e164: string | null;
  badge_tier: string;
}

function VerificationPage() {
  const { user } = useAuth();
  const submit = useServerFn(submitVerification);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [whats, setWhats] = useState("");
  const [latest, setLatest] = useState<Submission | null>(null);
  const cardRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    const [{ data: p }, { data: subs }] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name,whatsapp_e164,badge_tier")
        .eq("id", user.id)
        .single(),
      supabase
        .from("verification_submissions")
        .select("id,status,rejection_reason,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);
    if (p) {
      setProfile(p as Profile);
      setWhats(p.whatsapp_e164 ?? "");
    }
    setLatest((subs?.[0] as Submission) ?? null);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const saveWhatsapp = async () => {
    if (!user) return;
    const e164 = normaliseGhanaPhone(whats);
    if (!e164) return toast.error("Enter a valid Ghana phone number, e.g. 024 123 4567");
    const { error } = await supabase
      .from("profiles")
      .update({ whatsapp_e164: e164 })
      .eq("id", user.id);
    if (error) toast.error(error.message);
    else {
      toast.success("WhatsApp number saved");
      void load();
    }
  };

  const onSubmit = async () => {
    if (!user) return;
    if (!profile?.whatsapp_e164) return toast.error("Save your WhatsApp number first");
    if (!cardFile || !selfieFile) return toast.error("Upload both documents");
    setBusy(true);
    try {
      const upload = async (f: File, kind: "card" | "selfie") => {
        const ext = f.name.split(".").pop() || "jpg";
        const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from(VERIFICATION_DOCS_BUCKET)
          .upload(path, f, { upsert: false, contentType: f.type });
        if (error) throw error;
        return path;
      };
      const ghana_card_path = await upload(cardFile, "card");
      const selfie_path = await upload(selfieFile, "selfie");
      await submit({ data: { ghana_card_path, selfie_path } });
      toast.success("Verification submitted. We'll review within 1–2 days.");
      setCardFile(null);
      setSelfieFile(null);
      void load();
    } catch (e) {
      const m = e instanceof Error ? e.message : "Submission failed";
      toast.error(m);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <div>
          <h1 className="font-display text-[28px] font-extrabold tracking-tight">
            Get verified
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verified sellers display a badge and earn higher trust from buyers.
          </p>
        </div>

        {profile?.badge_tier && profile.badge_tier !== "none" && (
          <div className="flex items-center gap-2 rounded-2xl border-[1.5px] border-primary/30 bg-primary-soft p-3 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium capitalize">
              You are {profile.badge_tier.replace("_", " ")}
            </span>
          </div>
        )}

        <section className="space-y-3 rounded-2xl border-[1.5px] border-border bg-card p-5">
          <h2 className="font-display text-[16px] font-extrabold tracking-tight">
            WhatsApp number
          </h2>
          <p className="text-sm text-muted-foreground">
            Buyers will use this number to contact you. Required before submitting verification.
          </p>
          <div className="flex gap-2">
            <Input
              value={whats}
              onChange={(e) => setWhats(e.target.value)}
              placeholder="024 123 4567"
              className="rounded-xl"
            />
            <Button onClick={saveWhatsapp} className="rounded-xl">
              Save
            </Button>
          </div>
          {profile?.whatsapp_e164 && (
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Current: {profile.whatsapp_e164}
            </p>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border-[1.5px] border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[16px] font-extrabold tracking-tight">
              Identity documents
            </h2>
            {latest && (
              <Badge variant="outline" className="gap-1 capitalize">
                {latest.status === "pending" && <Clock className="h-3 w-3" />}
                {latest.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
                {latest.status === "rejected" && <ShieldAlert className="h-3 w-3" />}
                {latest.status}
              </Badge>
            )}
          </div>

          {latest?.status === "rejected" && latest.rejection_reason && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {latest.rejection_reason}
            </div>
          )}

          {(!latest || latest.status === "rejected") && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <FileBlock
                  label="Ghana Card (front)"
                  file={cardFile}
                  onPick={() => cardRef.current?.click()}
                />
                <input
                  ref={cardRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setCardFile(e.target.files?.[0] ?? null)}
                />
                <FileBlock
                  label="Selfie holding the card"
                  file={selfieFile}
                  onPick={() => selfieRef.current?.click()}
                />
                <input
                  ref={selfieRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button onClick={onSubmit} disabled={busy} className="w-full rounded-xl">
                {busy ? "Submitting…" : "Submit for review"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Documents are private and only visible to you and farmlink admins.
              </p>
            </>
          )}

          {latest?.status === "pending" && (
            <p className="text-sm text-muted-foreground">
              Submission received. Reviews usually take 1–2 days.
            </p>
          )}
          {latest?.status === "approved" && (
            <p className="text-sm text-muted-foreground">You're verified — thanks!</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function FileBlock({
  label,
  file,
  onPick,
}: {
  label: string;
  file: File | null;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface p-4 text-sm transition-colors hover:bg-muted"
    >
      {file ? (
        <img src={URL.createObjectURL(file)} alt="" className="h-32 w-full rounded-lg object-cover" />
      ) : (
        <ImagePlus className="h-8 w-8 text-muted-foreground" />
      )}
      <span className="font-medium">{file ? file.name : label}</span>
    </button>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
    >
      {children}
    </label>
  );
}
