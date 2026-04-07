DROP POLICY IF EXISTS "Anyone can view requirements" ON public.area_requirements;

CREATE POLICY "Users can view own requirements"
ON public.area_requirements
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Matching brokers can view area requirements"
ON public.area_requirements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.brokers b
    WHERE b.user_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM unnest(b.areas) AS broker_area
        WHERE LOWER(TRIM(broker_area)) = LOWER(TRIM(area_requirements.area))
      )
  )
);

CREATE POLICY "Admins can view all requirements"
ON public.area_requirements
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
