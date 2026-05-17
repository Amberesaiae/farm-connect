CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region text,
  topic text NOT NULL,
  message text NOT NULL,
  email text,
  user_id uuid,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_messages anon insert"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 80
    AND length(trim(message)) BETWEEN 10 AND 2000
    AND topic IN ('general','report','partnership','press','bug','account')
  );

CREATE POLICY "contact_messages admin read"
  ON public.contact_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON public.contact_messages (created_at DESC);