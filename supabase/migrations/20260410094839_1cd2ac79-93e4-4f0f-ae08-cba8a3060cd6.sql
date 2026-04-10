CREATE OR REPLACE FUNCTION public.get_published_properties(_city text DEFAULT NULL::text, _limit integer DEFAULT 50)
 RETURNS SETOF properties
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    id, user_id, title, description, location, city, price, image_url,
    bedrooms, bathrooms, area, property_type, listing_type, posted_by,
    CASE WHEN phone IS NOT NULL THEN 'XXXXXXXXXX' ELSE NULL END as phone,
    is_verified, is_featured, is_urgent, urgency_level, days_left,
    original_price, price_reduction, furnishing, deposit, available_from,
    latitude, longitude, status, created_at, updated_at, image_urls
  FROM public.properties
  WHERE status = 'published'
    AND (_city IS NULL OR city = _city)
  ORDER BY created_at DESC
  LIMIT _limit;
$$;