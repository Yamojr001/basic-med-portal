
-- 1. has_role: SECURITY INVOKER + restrict to caller's own UUID (prevents enumeration)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND _user_id = auth.uid()
  )
$$;

-- 2. Trigger helper functions: revoke EXECUTE from API roles (triggers fire as table owner)
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_bootstrap_admin() FROM PUBLIC, anon, authenticated;

-- 3. Drop the publicly-callable download counter; we'll do this server-side now
DROP FUNCTION IF EXISTS public.increment_resource_download(uuid);

-- 4. Quiz questions: hide correct_answer from the public
DROP POLICY IF EXISTS "Public can view quiz questions" ON public.quiz_questions;

CREATE OR REPLACE VIEW public.quiz_questions_public
WITH (security_invoker = true) AS
SELECT id, quiz_id, question_type, question_text, options, points, sort_order
FROM public.quiz_questions
WHERE EXISTS (
  SELECT 1 FROM public.quizzes q
  WHERE q.id = quiz_questions.quiz_id AND q.is_published = true
);

-- The view runs as the invoker; admins still need a SELECT path on the base table for the view to read
CREATE POLICY "Public can read questions (no answer) via view"
  ON public.quiz_questions
  FOR SELECT
  TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_questions.quiz_id AND q.is_published = true));

REVOKE SELECT (correct_answer) ON public.quiz_questions FROM anon, authenticated;

GRANT SELECT ON public.quiz_questions_public TO anon, authenticated;

-- 5. Quiz attempts: remove client-side INSERT. Server function (using service role) will write.
DROP POLICY IF EXISTS "Anyone can submit quiz attempts" ON public.quiz_attempts;
