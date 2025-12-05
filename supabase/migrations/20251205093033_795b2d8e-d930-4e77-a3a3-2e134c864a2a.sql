-- Add INSERT policy for profiles (users can create their own profile)
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Add INSERT policy for user_roles (only via trigger/service role, not direct)
-- Create a trigger to auto-create profile and user_role on auth signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, name, reg_number)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'reg_number', '')
  );
  
  -- Insert user role (default to 'student', can be 'admin' if specified in metadata)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::app_role
      ELSE 'student'::app_role
    END
  );
  
  -- If student, also create student_records entry
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

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();