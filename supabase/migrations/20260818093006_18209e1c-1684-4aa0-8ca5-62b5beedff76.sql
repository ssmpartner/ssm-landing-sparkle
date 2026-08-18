ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS gesperrt boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sperrgrund text NOT NULL DEFAULT '';