ALTER TABLE public.properties ADD COLUMN image_urls text[] DEFAULT '{}';

-- Backfill existing single image_url into the array
UPDATE public.properties SET image_urls = ARRAY[image_url] WHERE image_url IS NOT NULL AND image_url != '';