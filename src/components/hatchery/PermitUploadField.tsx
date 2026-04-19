import { useRef, useState } from "react";
import { Upload, FileCheck2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HATCHERY_PERMITS_BUCKET } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  value: string | null;
  onChange: (path: string | null) => void;
}

export function PermitUploadField({ value, onChange }: Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File) => {
    if (!user) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Permit file must be under 8MB");
      return;
    }
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Use PDF, JPG, PNG, or WEBP");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/${Date.now()}-permit.${ext}`;
      const { error } = await supabase.storage
        .from(HATCHERY_PERMITS_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      onChange(path);
      toast.success("Permit uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (value) {
    const filename = value.split("/").pop();
    return (
      <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-primary/30 bg-primary-soft/40 p-3">
        <FileCheck2 className="h-5 w-5 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-foreground">{filename}</p>
          <p className="text-[11px] text-muted-foreground">Stored privately. Only admins can view.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange(null)}
          aria-label="Remove permit"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card p-5 text-[13px] font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-60"
      >
        <Upload className="h-4 w-4" />
        {busy ? "Uploading…" : "Upload permit (PDF or photo)"}
      </button>
      <p className="mt-2 text-[11px] text-muted-foreground">
        VSD, Fisheries Commission, EPA, or District Assembly permit. PDF / image, max 8MB.
      </p>
    </div>
  );
}
