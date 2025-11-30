-- Add 'paid' status to project_expenses table status check constraint
-- Run this in your Supabase SQL editor

-- Drop the existing constraint
ALTER TABLE public.project_expenses 
DROP CONSTRAINT IF EXISTS project_expenses_status_check;

-- Add the new constraint with 'paid' status included
ALTER TABLE public.project_expenses 
ADD CONSTRAINT project_expenses_status_check 
CHECK (status::text = ANY (ARRAY[
  'draft'::character varying, 
  'submitted'::character varying, 
  'pending'::character varying, 
  'approved'::character varying, 
  'rejected'::character varying, 
  'reimbursed'::character varying,
  'paid'::character varying
]::text[]));

-- Verify the constraint was added
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'project_expenses' 
  AND con.conname = 'project_expenses_status_check';
