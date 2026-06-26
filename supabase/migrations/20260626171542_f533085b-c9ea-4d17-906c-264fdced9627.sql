
-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_bootstrap_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_resource_download(UUID) FROM PUBLIC;

-- has_role is used in RLS policies so it must be callable by anon/authenticated
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO anon, authenticated;
-- increment counter is intentionally public
GRANT EXECUTE ON FUNCTION public.increment_resource_download(UUID) TO anon, authenticated;

-- Tighten anon insert policy on quiz_attempts with a length sanity check rather than `WITH CHECK (true)`
DROP POLICY "Anyone can submit quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Anyone can submit quiz attempts" ON public.quiz_attempts
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    score >= 0 AND total_points > 0 AND percentage >= 0 AND percentage <= 100
  );
