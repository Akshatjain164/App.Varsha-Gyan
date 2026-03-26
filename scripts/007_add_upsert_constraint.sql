-- Add unique constraint on mission_progress for upsert operations
-- Note: mission_progress already has UNIQUE(student_id, mission_id) from 004,
-- but this script ensures it exists if the table was modified.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'mission_progress_student_mission_unique'
  ) THEN
    ALTER TABLE public.mission_progress 
    ADD CONSTRAINT mission_progress_student_mission_unique 
    UNIQUE (student_id, mission_id);
  END IF;
END $$;
