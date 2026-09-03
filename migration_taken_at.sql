ALTER TABLE public.moments ADD COLUMN IF NOT EXISTS taken_at DATE;
UPDATE public.moments SET taken_at = created_at::date WHERE taken_at IS NULL;
ALTER TABLE public.moments ALTER COLUMN taken_at SET DEFAULT CURRENT_DATE;
