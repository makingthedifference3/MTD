-- Migration: Fix orphaned records that don't have project_id set after migration 005
-- This script helps recover records where project_id couldn't be matched automatically

-- ============================================================================
-- DIAGNOSTIC QUERIES - Run these first to see what needs fixing
-- ============================================================================

-- Check for orphaned campaign_question_papers
-- SELECT id, campaign_type, created_at, project_id_old, project_id 
-- FROM public.campaign_question_papers 
-- WHERE project_id IS NULL AND project_id_old IS NOT NULL;

-- Check for orphaned student_answer_sheets
-- SELECT id, student_name, campaign_type, created_at, project_id_old, project_id 
-- FROM public.student_answer_sheets 
-- WHERE project_id IS NULL AND project_id_old IS NOT NULL;

-- Check for orphaned campaign_results
-- SELECT id, student_name, created_at, project_id_old, project_id 
-- FROM public.campaign_results 
-- WHERE project_id IS NULL AND project_id_old IS NOT NULL;

-- ============================================================================
-- FIX SCRIPTS - Run these to fix orphaned records
-- ============================================================================

-- Option 1: If you know which project these records belong to, update manually
-- Replace 'YOUR-PROJECT-UUID-HERE' with the actual project UUID from the projects table

-- Fix campaign_question_papers
-- UPDATE public.campaign_question_papers 
-- SET project_id = 'YOUR-PROJECT-UUID-HERE'::uuid
-- WHERE project_id IS NULL;

-- Fix student_answer_sheets
-- UPDATE public.student_answer_sheets 
-- SET project_id = 'YOUR-PROJECT-UUID-HERE'::uuid
-- WHERE project_id IS NULL;

-- Fix campaign_results
-- UPDATE public.campaign_results 
-- SET project_id = 'YOUR-PROJECT-UUID-HERE'::uuid
-- WHERE project_id IS NULL;

-- Option 2: Match by question_paper_id (for answer sheets only)
-- This tries to get project_id from the question paper that the sheet references
UPDATE public.student_answer_sheets sas
SET project_id = cqp.project_id
FROM public.campaign_question_papers cqp
WHERE sas.project_id IS NULL
  AND sas.question_paper_id = cqp.id
  AND cqp.project_id IS NOT NULL;

-- Option 3: If you have CSR partner info, you can narrow down the project
-- List projects to find the right UUID:
-- SELECT id, project_code, name, csr_partner_id 
-- FROM public.projects 
-- ORDER BY created_at DESC;

-- ============================================================================
-- CLEANUP - Run after fixing (OPTIONAL)
-- ============================================================================

-- Once you've verified that project_id is correctly set, you can drop the backup columns:
-- ALTER TABLE public.campaign_question_papers DROP COLUMN IF EXISTS project_id_old;
-- ALTER TABLE public.student_answer_sheets DROP COLUMN IF EXISTS project_id_old;
-- ALTER TABLE public.campaign_results DROP COLUMN IF EXISTS project_id_old;

-- ============================================================================
-- VALIDATION - Run to confirm everything is fixed
-- ============================================================================

-- Count records by table
SELECT 
  'campaign_question_papers' as table_name,
  COUNT(*) as total_records,
  COUNT(project_id) as with_project_id,
  COUNT(*) - COUNT(project_id) as missing_project_id
FROM public.campaign_question_papers
UNION ALL
SELECT 
  'student_answer_sheets',
  COUNT(*),
  COUNT(project_id),
  COUNT(*) - COUNT(project_id)
FROM public.student_answer_sheets
UNION ALL
SELECT 
  'campaign_results',
  COUNT(*),
  COUNT(project_id),
  COUNT(*) - COUNT(project_id)
FROM public.campaign_results;
