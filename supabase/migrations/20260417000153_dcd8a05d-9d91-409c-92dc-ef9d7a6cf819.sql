DROP POLICY IF EXISTS "Public can view active ads" ON public.admin_ads;

CREATE POLICY "Everyone can view active ads"
ON public.admin_ads
FOR SELECT
TO public
USING (status = 'active');