-- Phase 7: stop returning OTP code to the client.
-- The previous helper returned `debug_code` in JSON, which made phone
-- verification trivially bypassable. The new helper writes the hashed
-- code to phone_otps and returns ONLY {ok, sent_at}. Delivery happens
-- in the server function via Twilio (or another SMS provider).

CREATE OR REPLACE FUNCTION public.send_phone_otp(_phone_e164 text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_recent int;
  v_code text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHENTICATED');
  END IF;
  IF _phone_e164 !~ '^\+[1-9][0-9]{6,14}$' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'VALIDATION');
  END IF;

  SELECT COUNT(*) INTO v_recent FROM public.phone_otps
  WHERE user_id = v_uid AND sent_at > now() - interval '1 hour';
  IF v_recent >= 3 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'RATE_LIMITED', 'retryAfterSec', 3600);
  END IF;

  v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');

  INSERT INTO public.phone_otps (user_id, phone_e164, code_hash)
  VALUES (v_uid, _phone_e164, encode(digest(v_code, 'sha256'), 'hex'));

  -- Code intentionally NOT returned. The server function fetches the most
  -- recent unconsumed code via `peek_my_otp_for_send` (definer, single use)
  -- and dispatches it through the configured SMS provider.
  RETURN jsonb_build_object('ok', true, 'sent_at', now());
END;
$function$;

-- Helper used ONLY by the server function immediately after send_phone_otp,
-- to hand the freshly-generated plaintext code to the SMS provider. We
-- store it briefly in a side table so the SQL function can stay STABLE
-- and not return secrets through the JSON envelope.
CREATE TABLE IF NOT EXISTS public.phone_otp_dispatch (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_e164 text NOT NULL,
  plain_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  consumed_at timestamptz,
  PRIMARY KEY (user_id, created_at)
);
ALTER TABLE public.phone_otp_dispatch ENABLE ROW LEVEL SECURITY;
-- No policies: only SECURITY DEFINER functions touch it.

-- Replace previous send_phone_otp with one that also seeds the dispatch row
CREATE OR REPLACE FUNCTION public.send_phone_otp(_phone_e164 text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_recent int;
  v_code text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHENTICATED');
  END IF;
  IF _phone_e164 !~ '^\+[1-9][0-9]{6,14}$' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'VALIDATION');
  END IF;

  SELECT COUNT(*) INTO v_recent FROM public.phone_otps
  WHERE user_id = v_uid AND sent_at > now() - interval '1 hour';
  IF v_recent >= 3 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'RATE_LIMITED', 'retryAfterSec', 3600);
  END IF;

  v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');

  INSERT INTO public.phone_otps (user_id, phone_e164, code_hash)
  VALUES (v_uid, _phone_e164, encode(digest(v_code, 'sha256'), 'hex'));

  INSERT INTO public.phone_otp_dispatch (user_id, phone_e164, plain_code)
  VALUES (v_uid, _phone_e164, v_code);

  RETURN jsonb_build_object('ok', true, 'sent_at', now());
END;
$function$;

-- One-shot consumer: returns the latest unconsumed plaintext code for the
-- caller, marks it consumed, and deletes anything older than 5 minutes.
CREATE OR REPLACE FUNCTION public.consume_otp_for_dispatch()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.phone_otp_dispatch;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHENTICATED');
  END IF;

  DELETE FROM public.phone_otp_dispatch
  WHERE created_at < now() - interval '5 minutes';

  SELECT * INTO v_row FROM public.phone_otp_dispatch
  WHERE user_id = v_uid AND consumed_at IS NULL
  ORDER BY created_at DESC LIMIT 1;

  IF v_row.user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_FOUND');
  END IF;

  UPDATE public.phone_otp_dispatch
  SET consumed_at = now()
  WHERE user_id = v_row.user_id AND created_at = v_row.created_at;

  RETURN jsonb_build_object(
    'ok', true,
    'phone_e164', v_row.phone_e164,
    'code', v_row.plain_code
  );
END;
$function$;