
CREATE POLICY "Lecturers images readable by all" ON storage.objects FOR SELECT USING (bucket_id = 'lecturers');
CREATE POLICY "Admins can upload lecturer images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lecturers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update lecturer images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'lecturers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete lecturer images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'lecturers' AND public.has_role(auth.uid(), 'admin'));
