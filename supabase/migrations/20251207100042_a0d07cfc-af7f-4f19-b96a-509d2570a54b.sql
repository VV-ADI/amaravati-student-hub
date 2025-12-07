-- Update the handle_new_user function to include default subjects
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_profile_id uuid;
  default_attendance jsonb;
  default_marks jsonb;
BEGIN
  -- Check if profile with this reg_number already exists
  SELECT id INTO existing_profile_id FROM public.profiles 
  WHERE reg_number = COALESCE(NEW.raw_user_meta_data->>'reg_number', '');
  
  IF existing_profile_id IS NOT NULL THEN
    RAISE EXCEPTION 'Registration number already exists. Please use a different registration number or contact admin.';
  END IF;

  -- Define default subjects with 0 attendance
  default_attendance := '{
    "Discrete Mathematics": {"present": 0, "total": 0},
    "Coding Skills": {"present": 0, "total": 0},
    "C++ Programming": {"present": 0, "total": 0}
  }'::jsonb;

  -- Define default subjects with 0 marks
  default_marks := '{
    "Discrete Mathematics": {"internal1": 0, "internal2": 0, "external": 0},
    "Coding Skills": {"internal1": 0, "internal2": 0, "external": 0},
    "C++ Programming": {"internal1": 0, "internal2": 0, "external": 0}
  }'::jsonb;

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
  
  -- If student, create student_records entry with default subjects
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN
    INSERT INTO public.student_records (user_id, reg_number, name, email, department, semester, attendance, marks, is_placeholder)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'reg_number', ''),
      COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
      NEW.email,
      NEW.raw_user_meta_data->>'department',
      (NEW.raw_user_meta_data->>'semester')::integer,
      default_attendance,
      default_marks,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$;