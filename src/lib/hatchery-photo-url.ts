import { supabase } from "@/integrations/supabase/client";
import { HATCHERY_PHOTOS_BUCKET } from "./constants";

export function hatcheryPhotoUrl(path: string | null | undefined): string {
  if (!path) return "";
  return supabase.storage.from(HATCHERY_PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;
}
