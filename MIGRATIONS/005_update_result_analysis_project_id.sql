-- Migration: Update Result Analysis Tables to Use UUID for project_id
-- This migration converts project_id from TEXT to UUID and adds proper foreign key constraints
-- SAFE: Preserves all existing data by creating new columns and migrating data

-- Step 1: Update campaign_question_papers table
-- Create new UUID column
ALTER TABLE public.campaign_question_papers 
  ADD COLUMN IF NOT EXISTS project_id_new uuid;

-- Migrate data: Try to match TEXT project_id to actual project UUIDs
-- This handles cases where project_id might be a project code, name, or already a UUID
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'campaign_question_papers' 
             AND column_name = 'project_id') THEN
    
    -- First, try direct UUID conversion (if already UUID format)
    UPDATE public.campaign_question_papers cqp
    SET project_id_new = CAST(cqp.project_id AS uuid)
    WHERE cqp.project_id IS NOT NULL 
      AND cqp.project_id != ''
      AND cqp.project_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    -- Then, try to match by project_code
    UPDATE public.campaign_question_papers cqp
    SET project_id_new = p.id
    FROM public.projects p
    WHERE cqp.project_id_new IS NULL
      AND cqp.project_id IS NOT NULL
      AND cqp.project_id != ''
      AND p.project_code = cqp.project_id;
    
    -- Finally, try to match by project name
    UPDATE public.campaign_question_papers cqp
    SET project_id_new = p.id
    FROM public.projects p
    WHERE cqp.project_id_new IS NULL
      AND cqp.project_id IS NOT NULL
      AND cqp.project_id != ''
      AND p.name = cqp.project_id;
  END IF;
END $$;

-- Rename old column to backup
ALTER TABLE public.campaign_question_papers 
  RENAME COLUMN project_id TO project_id_old;

-- Rename new column to project_id
ALTER TABLE public.campaign_question_papers 
  RENAME COLUMN project_id_new TO project_id;

-- Add foreign key constraint
ALTER TABLE public.campaign_question_papers
  DROP CONSTRAINT IF EXISTS campaign_question_papers_project_id_fkey;
ALTER TABLE public.campaign_question_papers
  ADD CONSTRAINT campaign_question_papers_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Step 2: Update student_answer_sheets table
ALTER TABLE public.student_answer_sheets 
  ADD COLUMN IF NOT EXISTS project_id_new uuid;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'student_answer_sheets' 
             AND column_name = 'project_id') THEN
    
    -- Try direct UUID conversion
    UPDATE public.student_answer_sheets sas
    SET project_id_new = CAST(sas.project_id AS uuid)
    WHERE sas.project_id IS NOT NULL 
      AND sas.project_id != ''
      AND sas.project_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    -- Match by project_code
    UPDATE public.student_answer_sheets sas
    SET project_id_new = p.id
    FROM public.projects p
    WHERE sas.project_id_new IS NULL
      AND sas.project_id IS NOT NULL
      AND sas.project_id != ''
      AND p.project_code = sas.project_id;
    
    -- Match by project name
    UPDATE public.student_answer_sheets sas
    SET project_id_new = p.id
    FROM public.projects p
    WHERE sas.project_id_new IS NULL
      AND sas.project_id IS NOT NULL
      AND sas.project_id != ''
      AND p.name = sas.project_id;
  END IF;
END $$;

ALTER TABLE public.student_answer_sheets 
  RENAME COLUMN project_id TO project_id_old;

ALTER TABLE public.student_answer_sheets 
  RENAME COLUMN project_id_new TO project_id;

ALTER TABLE public.student_answer_sheets
  DROP CONSTRAINT IF EXISTS student_answer_sheets_project_id_fkey;
ALTER TABLE public.student_answer_sheets
  ADD CONSTRAINT student_answer_sheets_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Step 3: Update campaign_results table
ALTER TABLE public.campaign_results 
  ADD COLUMN IF NOT EXISTS project_id_new uuid;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'campaign_results' 
             AND column_name = 'project_id') THEN
    
    -- Try direct UUID conversion
    UPDATE public.campaign_results cr
    SET project_id_new = CAST(cr.project_id AS uuid)
    WHERE cr.project_id IS NOT NULL 
      AND cr.project_id != ''
      AND cr.project_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    -- Match by project_code
    UPDATE public.campaign_results cr
    SET project_id_new = p.id
    FROM public.projects p
    WHERE cr.project_id_new IS NULL
      AND cr.project_id IS NOT NULL
      AND cr.project_id != ''
      AND p.project_code = cr.project_id;
    
    -- Match by project name
    UPDATE public.campaign_results cr
    SET project_id_new = p.id
    FROM public.projects p
    WHERE cr.project_id_new IS NULL
      AND cr.project_id IS NOT NULL
      AND cr.project_id != ''
      AND p.name = cr.project_id;
  END IF;
END $$;

ALTER TABLE public.campaign_results 
  RENAME COLUMN project_id TO project_id_old;

ALTER TABLE public.campaign_results 
  RENAME COLUMN project_id_new TO project_id;

ALTER TABLE public.campaign_results
  DROP CONSTRAINT IF EXISTS campaign_results_project_id_fkey;
ALTER TABLE public.campaign_results
  ADD CONSTRAINT campaign_results_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Step 4: Add csr_partner_id tracking to result analysis tables (optional but useful)
ALTER TABLE public.campaign_question_papers 
  ADD COLUMN IF NOT EXISTS csr_partner_id uuid;

ALTER TABLE public.campaign_question_papers
  ADD CONSTRAINT campaign_question_papers_csr_partner_id_fkey 
  FOREIGN KEY (csr_partner_id) REFERENCES public.csr_partners(id) ON DELETE CASCADE;

ALTER TABLE public.student_answer_sheets 
  ADD COLUMN IF NOT EXISTS csr_partner_id uuid;

ALTER TABLE public.student_answer_sheets
  ADD CONSTRAINT student_answer_sheets_csr_partner_id_fkey 
  FOREIGN KEY (csr_partner_id) REFERENCES public.csr_partners(id) ON DELETE CASCADE;

ALTER TABLE public.campaign_results 
  ADD COLUMN IF NOT EXISTS csr_partner_id uuid;

ALTER TABLE public.campaign_results
  ADD CONSTRAINT campaign_results_csr_partner_id_fkey 
  FOREIGN KEY (csr_partner_id) REFERENCES public.csr_partners(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaign_question_papers_project_id 
  ON public.campaign_question_papers(project_id);
CREATE INDEX IF NOT EXISTS idx_campaign_question_papers_csr_partner_id 
  ON public.campaign_question_papers(csr_partner_id);
CREATE INDEX IF NOT EXISTS idx_campaign_question_papers_campaign_type 
  ON public.campaign_question_papers(campaign_type);

CREATE INDEX IF NOT EXISTS idx_student_answer_sheets_project_id 
  ON public.student_answer_sheets(project_id);
CREATE INDEX IF NOT EXISTS idx_student_answer_sheets_csr_partner_id 
  ON public.student_answer_sheets(csr_partner_id);
CREATE INDEX IF NOT EXISTS idx_student_answer_sheets_campaign_type 
  ON public.student_answer_sheets(campaign_type);
CREATE INDEX IF NOT EXISTS idx_student_answer_sheets_question_paper_id 
  ON public.student_answer_sheets(question_paper_id);

CREATE INDEX IF NOT EXISTS idx_campaign_results_project_id 
  ON public.campaign_results(project_id);
CREATE INDEX IF NOT EXISTS idx_campaign_results_csr_partner_id 
  ON public.campaign_results(csr_partner_id);
CREATE INDEX IF NOT EXISTS idx_campaign_results_status 
  ON public.campaign_results(status);
