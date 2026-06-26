
-- Public read on the three buckets
CREATE POLICY "Public read resources bucket" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('resources','gallery','branding'));

-- Admin write/update/delete
CREATE POLICY "Admins upload to faculty buckets" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('resources','gallery','branding') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update faculty buckets" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('resources','gallery','branding') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete from faculty buckets" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('resources','gallery','branding') AND public.has_role(auth.uid(),'admin'));
