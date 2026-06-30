
-- Drop the security-definer views from the previous migration
DROP VIEW IF EXISTS public.lecturers_public;
DROP VIEW IF EXISTS public.quiz_questions_public;

-- ===== LECTURERS: column-level public access =====
REVOKE SELECT ON public.lecturers FROM anon, authenticated;

GRANT SELECT
  (id, name, title, position, department_id, qualifications, specialization,
   bio, office, image_url, sort_order, is_published, created_at, updated_at)
ON public.lecturers TO anon, authenticated;

CREATE POLICY "Public can view published lecturers"
ON public.lecturers FOR SELECT TO anon, authenticated
USING (is_published = true OR public.has_role(auth.uid(), 'admin'::app_role));

-- ===== QUIZ_QUESTIONS: column-level public access =====
REVOKE SELECT ON public.quiz_questions FROM anon, authenticated;

GRANT SELECT
  (id, quiz_id, question_type, question_text, options, points, sort_order)
ON public.quiz_questions TO anon, authenticated;

CREATE POLICY "Public can read quiz questions (no answers)"
ON public.quiz_questions FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.quizzes q
               WHERE q.id = quiz_questions.quiz_id AND q.is_published = true));
