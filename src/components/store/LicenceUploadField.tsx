import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

interface Props {
  value: string | null;
  onChange: (path: string | null) => void;
}

export function LicenceUploadField({ value, onChange }: Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!user) return;
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${user.id}/licence-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("vendor-licences").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;
      onChange(path);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? "Uploading…" : value ? "Replace document" : "Upload licence"}
        </Button>
        {value ? <span className="text-[12px] text-muted-foreground">Uploaded ✓</span> : null}
      </div>
      {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
      <p className="text-[11px] text-muted-foreground">
        Private — only you and Farmlink admins can view this. JPG, PNG or PDF.
      </p>
    </div>
  );
}
