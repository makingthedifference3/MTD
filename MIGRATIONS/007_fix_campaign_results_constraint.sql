-- Fix: Remove NOT NULL constraint from project_id_old column
-- This column is just a backup and should allow NULL values

ALTER TABLE public.campaign_results 
  ALTER COLUMN project_id_old DROP NOT NULL;

ALTER TABLE public.campaign_question_papers 
  ALTER COLUMN project_id_old DROP NOT NULL;

ALTER TABLE public.student_answer_sheets 
  ALTER COLUMN project_id_old DROP NOT NULL;
