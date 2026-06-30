
-- 1) LECTURERS: hide email/phone from public
DROP POLICY IF EXISTS "Lecturers are publicly readable when published" ON public.lecturers;

CREATE POLICY "Admins can view all lecturers"
ON public.lecturers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.lecturers_public
WITH (security_invoker = false) AS
SELECT id, name, title, position, department_id, qualifications,
       specialization, bio, office, image_url, sort_order, is_published,
       created_at, updated_at
FROM public.lecturers
WHERE is_published = true;

GRANT SELECT ON public.lecturers_public TO anon, authenticated;

-- 2) QUIZ_QUESTIONS: remove public read on base table; expose via view only
DROP POLICY IF EXISTS "Public can read questions (no answer) via view" ON public.quiz_questions;

-- Ensure the public view exists and excludes correct_answer, runs as definer
CREATE OR REPLACE VIEW public.quiz_questions_public
WITH (security_invoker = false) AS
SELECT qq.id, qq.quiz_id, qq.question_type, qq.question_text,
       qq.options, qq.points, qq.sort_order
FROM public.quiz_questions qq
JOIN public.quizzes q ON q.id = qq.quiz_id
WHERE q.is_published = true;

GRANT SELECT ON public.quiz_questions_public TO anon, authenticated;

-- 3) QUIZ_ATTEMPTS: explicit restrictive deny of public inserts.
-- Submissions only via the server function using service role (bypasses RLS).
CREATE POLICY "Block direct inserts on quiz_attempts"
ON public.quiz_attempts AS RESTRICTIVE FOR INSERT TO anon, authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
