
-- Create function to notify brokers when a new area requirement is posted
CREATE OR REPLACE FUNCTION public.notify_brokers_on_requirement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  broker_record RECORD;
  clean_area TEXT;
BEGIN
  clean_area := LOWER(TRIM(NEW.area));

  FOR broker_record IN
    SELECT id FROM public.brokers
    WHERE EXISTS (
      SELECT 1
      FROM unnest(areas) AS a
      WHERE LOWER(TRIM(a)) = clean_area
    )
  LOOP
    INSERT INTO public.broker_notifications (
      broker_id,
      title,
      message,
      type,
      created_at
    )
    VALUES (
      broker_record.id,
      '📋 New Requirement in ' || NEW.area,
      COALESCE(NEW.name, 'Someone') || ' is looking for ' || COALESCE(NEW.property_type, 'property') || ' in ' || NEW.area || '. Budget: ' || COALESCE(NEW.budget, 'Not specified'),
      'requirement',
      now()
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger on area_requirements
CREATE TRIGGER on_new_area_requirement
  AFTER INSERT ON public.area_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_brokers_on_requirement();
