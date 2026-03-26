-- Fix profiles table: make full_name nullable so trigger never fails
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;

-- Replace trigger function with a more robust version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, class_grade)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
      SPLIT_PART(NEW.email, '@', 1),
      'User'
    ),
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'role'), ''),
      'student'
    ),
    CASE
      WHEN COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'role'), ''), 'student') = 'student'
        AND NEW.raw_user_meta_data ->> 'class_grade' IS NOT NULL
      THEN (NEW.raw_user_meta_data ->> 'class_grade')::INT
      ELSE 6
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    class_grade = EXCLUDED.class_grade,
    full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name);
  RETURN NEW;
END;
$$;

-- Recreate trigger (drop first to ensure clean state)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
