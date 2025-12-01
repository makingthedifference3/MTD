-- Fix 1: Add 'accepted' status to project_expenses status constraint
-- Drop the old constraint
ALTER TABLE public.project_expenses 
DROP CONSTRAINT IF EXISTS project_expenses_status_check;

-- Add new constraint with 'accepted' status included
ALTER TABLE public.project_expenses 
ADD CONSTRAINT project_expenses_status_check 
CHECK (status::text = ANY (ARRAY[
  'draft'::character varying::text, 
  'submitted'::character varying::text, 
  'pending'::character varying::text, 
  'accepted'::character varying::text,  -- Added this status
  'approved'::character varying::text, 
  'rejected'::character varying::text, 
  'reimbursed'::character varying::text, 
  'paid'::character varying::text
]));

-- Fix 2: The tolls table doesn't exist - using csr_partner_tolls instead
-- No SQL needed, will fix in TypeScript code
