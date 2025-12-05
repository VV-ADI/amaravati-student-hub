-- Update trigger to handle duplicate reg_numbers gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_profile_id uuid;
BEGIN
  -- Check if profile with this reg_number already exists
  SELECT id INTO existing_profile_id FROM public.profiles 
  WHERE reg_number = COALESCE(NEW.raw_user_meta_data->>'reg_number', '');
  
  IF existing_profile_id IS NOT NULL THEN
    RAISE EXCEPTION 'Registration number already exists. Please use a different registration number or contact admin.';
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (id, email, name, reg_number, department, semester)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'reg_number', ''),
    NEW.raw_user_meta_data->>'department',
    (NEW.raw_user_meta_data->>'semester')::integer
  );
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::app_role
      ELSE 'student'::app_role
    END
  );
  
  -- If student, create student_records entry
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN
    INSERT INTO public.student_records (user_id, reg_number, name, email, department, semester)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'reg_number', ''),
      COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
      NEW.email,
      NEW.raw_user_meta_data->>'department',
      (NEW.raw_user_meta_data->>'semester')::integer
    );
  END IF;
  
  RETURN NEW;
END;
$$;