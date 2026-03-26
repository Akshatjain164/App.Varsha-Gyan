-- Create missions table (14 predefined missions)
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

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Everyone can read missions
CREATE POLICY "Anyone can view missions" 
  ON public.missions FOR SELECT 
  TO authenticated
  USING (true);
