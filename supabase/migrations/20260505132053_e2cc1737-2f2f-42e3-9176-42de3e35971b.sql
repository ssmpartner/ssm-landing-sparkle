CREATE TABLE public.beratungstermine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  thema text NOT NULL,
  name text NOT NULL,
  kontakt text NOT NULL,
  bevorzugte_zeit text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'neu',
  notes text NOT NULL DEFAULT ''
);

ALTER TABLE public.beratungstermine ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit beratungstermine"
  ON public.beratungstermine FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can view beratungstermine"
  ON public.beratungstermine FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update beratungstermine"
  ON public.beratungstermine FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete beratungstermine"
  ON public.beratungstermine FOR DELETE
  TO authenticated
  USING (true);