CREATE TABLE public.lecturers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  title text,
  position text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  qualifications text,
  specialization text,
  bio text,
  email text,
  phone text,
  office text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.lecturers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lecturers TO authenticated;
GRANT ALL ON public.lecturers TO service_role;

ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecturers are publicly readable when published"
  ON public.lecturers FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage lecturers"
  ON public.lecturers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER lecturers_set_updated_at
  BEFORE UPDATE ON public.lecturers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();