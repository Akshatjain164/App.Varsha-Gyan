-- Create mission progress table
CREATE TABLE IF NOT EXISTS public.mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score INT DEFAULT 0,
  time_spent INT DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, mission_id)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Mission progress policies
CREATE POLICY "Students can view their own progress" 
  ON public.mission_progress FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own progress" 
  ON public.mission_progress FOR INSERT 
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own progress" 
  ON public.mission_progress FOR UPDATE 
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view progress of students in their classes" 
  ON public.mission_progress FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      JOIN public.classes c ON ce.class_id = c.id
      WHERE ce.student_id = mission_progress.student_id
      AND c.teacher_id = auth.uid()
    )
  );

-- Assignments policies
CREATE POLICY "Teachers can create assignments for their classes" 
  ON public.assignments FOR INSERT 
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can view their assignments" 
  ON public.assignments FOR SELECT 
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view assignments for their classes" 
  ON public.assignments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      WHERE ce.class_id = assignments.class_id
      AND ce.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete their assignments" 
  ON public.assignments FOR DELETE 
  USING (teacher_id = auth.uid());

-- Achievements policies
CREATE POLICY "Students can view their own achievements" 
  ON public.achievements FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Students can earn achievements" 
  ON public.achievements FOR INSERT 
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view achievements of their students" 
  ON public.achievements FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      JOIN public.classes c ON ce.class_id = c.id
      WHERE ce.student_id = achievements.student_id
      AND c.teacher_id = auth.uid()
    )
  );
