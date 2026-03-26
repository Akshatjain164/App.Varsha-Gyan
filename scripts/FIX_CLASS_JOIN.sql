-- Fix: Allow any authenticated user to find classes by code
-- Run this in Supabase SQL Editor

-- Drop conflicting policies if they exist
DROP POLICY IF EXISTS "Anyone can find class by code" ON public.classes;
DROP POLICY IF EXISTS "Students can view classes they are enrolled in" ON public.classes;
DROP POLICY IF EXISTS "Students can view classes they're enrolled in" ON public.classes;

-- Recreate: let any logged-in user SELECT from classes (needed to join by code)
CREATE POLICY "Any authenticated user can view classes"
  ON public.classes FOR SELECT
  TO authenticated
  USING (true);
