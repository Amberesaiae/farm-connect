import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { listingPhotoUrl } from "@/lib/photo-url";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

interface Props {
  kind: "cover" | "logo";
  value: string | null;
  onChange: (path: string | null) => void;
}

const MAX_BYTES = 5 * 1024 * 1024;

export function CoverLogoUpload({ kind, value, onChange }: Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    if (!user) return;
    if (file.size > MAX_BYTES) return toast.error("Image must be under 5MB");
    if (!file.type.startsWith("image/")) return toast.error("Pick an image file");
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/store-${kind}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      onChange(path);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const url = listingPhotoUrl(value);
  const aspectClass = kind === "cover" ? "aspect-[16/9]" : "aspect-square w-28";

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
        }}
      />
      <div
        className={`relative ${aspectClass} overflow-hidden rounded-xl border-[1.5px] border-dashed border-border bg-surface`}
      >
        {url ? (
          <>
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[11.5px] font-semibold">
              {kind === "cover" ? "Add cover image" : "Add logo"}
            </span>
          </button>
        )}
      </div>
      {url && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Uploading…" : "Replace"}
        </Button>
      )}
    </div>
  );
}
