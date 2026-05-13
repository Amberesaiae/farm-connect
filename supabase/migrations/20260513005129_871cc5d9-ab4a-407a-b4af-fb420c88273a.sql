
-- Drop the table-wide SELECT so the column-level grants are authoritative.
REVOKE SELECT ON public.profiles FROM anon, authenticated;

-- Re-grant SELECT only on safe columns.
GRANT SELECT (
  id, display_name, avatar_url, region, district, badge_tier, trade_count,
  listing_count, status, phone_verified, id_verified, business_licensed,
  phone_verified_at, id_verified_at, suspended_at, suspension_reason,
  roles, active_role, created_at, updated_at
) ON public.profiles TO anon, authenticated;
