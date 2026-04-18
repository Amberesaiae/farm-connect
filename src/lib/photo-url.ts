import { supabase } from "@/integrations/supabase/client";
import { LISTING_PHOTOS_BUCKET } from "./constants";

export function listingPhotoUrl(path: string | null | undefined): string {
  if (!path) return "";
  return supabase.storage.from(LISTING_PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl;
}
