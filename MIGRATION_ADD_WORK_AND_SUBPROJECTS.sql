-- Migration: Add work column and sub-projects support
-- Run this on Supabase SQL Editor

-- 1. Add 'work' column to projects table (replaces category conceptually but we keep category for backward compatibility)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS work character varying;

-- 2. Add parent_project_id for sub-projects support
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS parent_project_id uuid;

-- 3. Add is_beneficiary_project flag to identify auto-created beneficiary sub-projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS is_beneficiary_project boolean DEFAULT false;

-- 4. Add beneficiary_number to track which beneficiary number this sub-project represents
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS beneficiary_number integer;

-- 5. Add foreign key constraint for parent_project_id
ALTER TABLE public.projects 
ADD CONSTRAINT projects_parent_project_id_fkey 
FOREIGN KEY (parent_project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- 6. Create index for faster parent/child queries
CREATE INDEX IF NOT EXISTS idx_projects_parent_project_id ON public.projects(parent_project_id);
CREATE INDEX IF NOT EXISTS idx_projects_work ON public.projects(work);

-- 7. Copy existing category values to work column (optional - run if you want to migrate existing data)
UPDATE public.projects SET work = category WHERE work IS NULL AND category IS NOT NULL;

-- 8. Add comment for documentation
COMMENT ON COLUMN public.projects.work IS 'Type of work/activity for this project (replaces category)';
COMMENT ON COLUMN public.projects.parent_project_id IS 'Reference to parent project for sub-projects';
COMMENT ON COLUMN public.projects.is_beneficiary_project IS 'True if this project was auto-created as a beneficiary sub-project';
COMMENT ON COLUMN public.projects.beneficiary_number IS 'Sequential number of the beneficiary (1, 2, 3, etc.)';
