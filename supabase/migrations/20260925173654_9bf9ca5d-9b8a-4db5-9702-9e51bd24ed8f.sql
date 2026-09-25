DROP POLICY "Admins insert locus objects" ON public.locus_objects;
DROP POLICY "Admins update locus objects" ON public.locus_objects;
DROP POLICY "Admins delete locus objects" ON public.locus_objects;
DROP POLICY "Admins upload locus object files" ON storage.objects;
DROP POLICY "Admins update locus object files" ON storage.objects;
DROP POLICY "Admins delete locus object files" ON storage.objects;

DROP FUNCTION public.has_role(uuid, public.app_role);

CREATE POLICY "Admins insert locus objects"
ON public.locus_objects FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins update locus objects"
ON public.locus_objects FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins delete locus objects"
ON public.locus_objects FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins upload locus object files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'locus-objects'
  AND lower(storage.extension(name)) = 'glb'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins update locus object files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'locus-objects'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'locus-objects'
  AND lower(storage.extension(name)) = 'glb'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins delete locus object files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'locus-objects'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
