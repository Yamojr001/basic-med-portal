
-- LECTURERS: keep column-restricted public read, give full read back to admins
DROP POLICY IF EXISTS "Public can view published lecturers" ON public.lecturers;
DROP POLICY IF EXISTS "Admins can view all lecturers" ON public.lecturers;

GRANT SELECT ON public.lecturers TO authenticated;

CREATE POLICY "Anon can view published lecturers (safe columns)"
ON public.lecturers FOR SELECT TO anon
USING (is_published = true);

CREATE POLICY "Admins can view all lecturer fields"
ON public.lecturers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- QUIZ_QUESTIONS: same pattern
DROP POLICY IF EXISTS "Public can read quiz questions (no answers)" ON public.quiz_questions;

GRANT SELECT ON public.quiz_questions TO authenticated;

CREATE POLICY "Anon can read questions of published quizzes (no answers)"
ON public.quiz_questions FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM public.quizzes q
               WHERE q.id = quiz_questions.quiz_id AND q.is_published = true));

-- Admin SELECT already covered by existing "Admins manage quiz questions" ALL policy.
