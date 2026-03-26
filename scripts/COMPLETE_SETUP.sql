-- =====================================================
-- VARSHA-GYAN COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- 0) FIX PROFILES TRIGGER (ensures role gets saved correctly)
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade INT NOT NULL CHECK (grade >= 6 AND grade <= 12),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

-- Classes policies
CREATE POLICY "Teachers can view their own classes" ON public.classes FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Students can view classes they are enrolled in" ON public.classes FOR SELECT USING (EXISTS (SELECT 1 FROM public.class_enrollments ce WHERE ce.class_id = id AND ce.student_id = auth.uid()));
CREATE POLICY "Anyone can find class by code" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can create classes" ON public.classes FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Teachers can update their own classes" ON public.classes FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can delete their own classes" ON public.classes FOR DELETE USING (teacher_id = auth.uid());

CREATE POLICY "Students can view their own enrollments" ON public.class_enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Teachers can view enrollments in their classes" ON public.class_enrollments FOR SELECT USING (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid()));
CREATE POLICY "Students can enroll themselves" ON public.class_enrollments FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can unenroll themselves" ON public.class_enrollments FOR DELETE USING (student_id = auth.uid());

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


-- 2) MISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_hi TEXT NOT NULL,
  instructions_en TEXT NOT NULL,
  instructions_hi TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology', 'mathematics')),
  target_class INT NOT NULL CHECK (target_class >= 6 AND target_class <= 12),
  simulation_type TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  complexity_level INT NOT NULL CHECK (complexity_level >= 1 AND complexity_level <= 7),
  xp_reward INT NOT NULL DEFAULT 100,
  icon_name TEXT NOT NULL,
  theme_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view missions" ON public.missions FOR SELECT TO authenticated USING (true);


-- 3) PROGRESS, ASSIGNMENTS, ACHIEVEMENTS
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

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own progress" ON public.mission_progress FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can insert their own progress" ON public.mission_progress FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update their own progress" ON public.mission_progress FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Teachers can view progress of students in their classes" ON public.mission_progress FOR SELECT USING (EXISTS (SELECT 1 FROM public.class_enrollments ce JOIN public.classes c ON ce.class_id = c.id WHERE ce.student_id = mission_progress.student_id AND c.teacher_id = auth.uid()));

CREATE POLICY "Teachers can create assignments" ON public.assignments FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Teachers can view their assignments" ON public.assignments FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Students can view assignments for their classes" ON public.assignments FOR SELECT USING (EXISTS (SELECT 1 FROM public.class_enrollments ce WHERE ce.class_id = assignments.class_id AND ce.student_id = auth.uid()));
CREATE POLICY "Teachers can delete their assignments" ON public.assignments FOR DELETE USING (teacher_id = auth.uid());

CREATE POLICY "Students can view their own achievements" ON public.achievements FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can earn achievements" ON public.achievements FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Teachers can view student achievements" ON public.achievements FOR SELECT USING (EXISTS (SELECT 1 FROM public.class_enrollments ce JOIN public.classes c ON ce.class_id = c.id WHERE ce.student_id = achievements.student_id AND c.teacher_id = auth.uid()));


-- 4) SEED 14 MISSIONS (Class 6-12)
INSERT INTO public.missions (title_en, title_hi, description_en, description_hi, instructions_en, instructions_hi, subject, target_class, simulation_type, difficulty, complexity_level, xp_reward, icon_name, theme_color) VALUES
('Light & Shadows', 'प्रकाश और छाया', 'Explore how light creates shadows by positioning objects and light sources.', 'वस्तुओं और प्रकाश स्रोतों को रखकर देखें कि प्रकाश कैसे छाया बनाता है।', 'Move the torch around to see how shadows change.', 'छाया कैसे बदलती है यह देखने के लिए टॉर्च को घुमाएं।', 'physics', 6, 'light-shadows', 'beginner', 1, 100, 'Sun', '#00d4ff'),
('Number Line Adventure', 'संख्या रेखा साहसिक', 'Jump along the number line to add and subtract whole numbers.', 'पूर्ण संख्याओं को जोड़ने और घटाने के लिए संख्या रेखा पर कूदें।', 'Click + or - to move along the number line.', 'संख्या रेखा पर आगे बढ़ने के लिए + या - पर क्लिक करें।', 'mathematics', 6, 'number-line-basic', 'beginner', 1, 100, 'Calculator', '#00d4ff'),
('Heat Transfer Lab', 'ऊष्मा स्थानांतरण प्रयोगशाला', 'Watch heat flow between objects through conduction.', 'चालन के माध्यम से वस्तुओं के बीच ऊष्मा प्रवाह देखें।', 'Select different materials and watch temperature change.', 'विभिन्न सामग्रियों का चयन करें और तापमान परिवर्तन देखें।', 'physics', 7, 'heat-transfer', 'beginner', 2, 120, 'Thermometer', '#00d4ff'),
('Plant Cell Explorer', 'पादप कोशिका अन्वेषक', 'Dive into a plant cell and discover its organelles.', 'पादप कोशिका में गोता लगाएं और इसके अंगकों की खोज करें।', 'Click on different parts of the cell to learn about them.', 'सेल के विभिन्न हिस्सों पर क्लिक करें।', 'biology', 7, 'plant-cell', 'beginner', 2, 120, 'Leaf', '#00d4ff'),
('Friction Laboratory', 'घर्षण प्रयोगशाला', 'Experiment with friction forces on different surfaces.', 'विभिन्न सतहों पर घर्षण बलों के साथ प्रयोग करें।', 'Select a surface type and apply force to the block.', 'सतह का प्रकार चुनें और ब्लॉक पर बल लगाएं।', 'physics', 8, 'friction-lab', 'intermediate', 3, 150, 'Box', '#3b82f6'),
('Chemical Reaction Builder', 'रासायनिक अभिक्रिया निर्माता', 'Combine elements to create chemical reactions.', 'रासायनिक अभिक्रियाएं बनाने के लिए तत्वों को मिलाएं।', 'Drag elements to the reaction zone.', 'तत्वों को अभिक्रिया क्षेत्र में खींचें।', 'chemistry', 8, 'chemical-reactions', 'intermediate', 3, 150, 'FlaskConical', '#3b82f6'),
('Projectile Motion', 'प्रक्षेप्य गति', 'Launch projectiles and study their trajectory.', 'प्रक्षेप्य लॉन्च करें और उनके प्रक्षेपवक्र का अध्ययन करें।', 'Set the launch angle and initial velocity.', 'लॉन्च कोण और प्रारंभिक वेग सेट करें।', 'physics', 9, 'projectile-motion', 'intermediate', 4, 180, 'Crosshair', '#3b82f6'),
('pH Scale Laboratory', 'pH स्केल प्रयोगशाला', 'Test various substances on the pH scale.', 'pH स्केल पर विभिन्न पदार्थों का परीक्षण करें।', 'Drag substances into the testing beaker.', 'पदार्थों को परीक्षण बीकर में खींचें।', 'chemistry', 9, 'ph-scale', 'intermediate', 4, 180, 'TestTube', '#3b82f6'),
('Ohm''s Law Circuit', 'ओम का नियम सर्किट', 'Build circuits and verify Ohm''s law.', 'विद्युत परिपथ बनाएं और ओम के नियम को सत्यापित करें।', 'Connect components to build a circuit.', 'सर्किट बनाने के लिए घटकों को जोड़ें।', 'physics', 10, 'ohms-law', 'advanced', 5, 200, 'Zap', '#a855f7'),
('Osmosis & Diffusion', 'परासरण और विसरण', 'Visualize how molecules move across cell membranes.', 'देखें कि अणु कोशिका झिल्ली के पार कैसे गति करते हैं।', 'Adjust concentration on each side of the membrane.', 'झिल्ली के प्रत्येक तरफ सांद्रता समायोजित करें।', 'biology', 10, 'osmosis-diffusion', 'advanced', 5, 200, 'Droplets', '#a855f7'),
('Vector Operations', 'सदिश संक्रियाएं', 'Perform vector addition, subtraction, and find components.', 'सदिश जोड़, घटाव और घटक खोजें।', 'Draw vectors by clicking and dragging.', 'क्लिक और ड्रैग करके सदिश बनाएं।', 'physics', 11, 'vector-operations', 'advanced', 6, 220, 'ArrowUpRight', '#a855f7'),
('Electromagnetic Induction', 'विद्युत चुम्बकीय प्रेरण', 'Generate electricity by moving magnets through coils.', 'कुंडलियों के माध्यम से चुंबक को घुमाकर बिजली उत्पन्न करें।', 'Move the magnet through the coil.', 'चुंबक को कुंडली के माध्यम से घुमाएं।', 'physics', 11, 'em-induction', 'advanced', 6, 220, 'Magnet', '#a855f7'),
('Wave Optics', 'तरंग प्रकाशिकी', 'Observe interference and diffraction patterns.', 'व्यतिकरण और विवर्तन पैटर्न देखें।', 'Adjust slit width and separation.', 'स्लिट चौड़ाई और पृथक्करण समायोजित करें।', 'physics', 12, 'wave-optics', 'expert', 7, 250, 'Waves', '#f59e0b'),
('Semiconductor Physics', 'अर्धचालक भौतिकी', 'Explore P-N junctions and their behavior under bias.', 'P-N जंक्शन और बायस के तहत उनके व्यवहार का अन्वेषण करें।', 'Apply forward and reverse bias to the diode.', 'डायोड पर अग्र और पश्च बायस लागू करें।', 'physics', 12, 'semiconductors', 'expert', 7, 250, 'Cpu', '#f59e0b');


-- 5) XP FUNCTION
CREATE OR REPLACE FUNCTION public.add_xp(user_id UUID, xp_amount INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET total_xp = total_xp + xp_amount
  WHERE id = user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_xp(UUID, INT) TO authenticated;

-- DONE! ✅
