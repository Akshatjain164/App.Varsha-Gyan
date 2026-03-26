-- Create classes table (created by teachers)
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade INT NOT NULL CHECK (grade >= 6 AND grade <= 12),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class enrollments table
CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

-- Classes policies
CREATE POLICY "Teachers can view their own classes" 
  ON public.classes FOR SELECT 
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view classes they're enrolled in" 
  ON public.classes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      WHERE ce.class_id = id AND ce.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create classes" 
  ON public.classes FOR INSERT 
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own classes" 
  ON public.classes FOR UPDATE 
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own classes" 
  ON public.classes FOR DELETE 
  USING (teacher_id = auth.uid());

-- Enrollment policies
CREATE POLICY "Students can view their own enrollments" 
  ON public.class_enrollments FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view enrollments in their classes" 
  ON public.class_enrollments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can enroll themselves" 
  ON public.class_enrollments FOR INSERT 
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can unenroll themselves" 
  ON public.class_enrollments FOR DELETE 
  USING (student_id = auth.uid());

-- Function to generate unique class code
CREATE OR REPLACE FUNCTION generate_class_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
