CREATE POLICY "Matching brokers can update area requirements"
ON public.area_requirements
FOR UPDATE
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
)
WITH CHECK (
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
