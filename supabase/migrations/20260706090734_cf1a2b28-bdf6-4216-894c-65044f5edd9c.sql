CREATE TABLE public.anfragen (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  telefon text NOT NULL DEFAULT '',
  betreff text NOT NULL DEFAULT '',
  nachricht text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'neu',
  notes text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.anfragen TO authenticated;
GRANT INSERT ON public.anfragen TO anon;
GRANT ALL ON public.anfragen TO service_role;

ALTER TABLE public.anfragen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit anfragen"
  ON public.anfragen FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view anfragen"
  ON public.anfragen FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update anfragen"
  ON public.anfragen FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete anfragen"
  ON public.anfragen FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_anfragen_updated_at
  BEFORE UPDATE ON public.anfragen
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();