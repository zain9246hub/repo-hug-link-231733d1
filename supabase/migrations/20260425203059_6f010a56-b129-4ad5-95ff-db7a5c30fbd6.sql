CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Hardcoded admin email removed. Admin roles must be assigned manually.
  RETURN NEW;
END;
$function$;