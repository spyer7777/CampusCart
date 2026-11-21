-- Allow account creation with any email domain.
-- Non-AITH accounts get a profile with campus_id = NULL and cannot access
-- campus-scoped listings under the existing RLS policies.
CREATE OR REPLACE FUNCTION public.create_student_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched_campus_id UUID;
BEGIN
  SELECT id INTO matched_campus_id
  FROM public.campuses
  WHERE lower(split_part(NEW.email, '@', 2)) = ANY(email_domains)
  LIMIT 1;

  INSERT INTO public.users (id, name, email, campus_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    matched_campus_id
  );
  RETURN NEW;
END;
$$;
