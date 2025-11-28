-- ============================================
-- Add Multiple Roles Support to project_team_members
-- ============================================

-- Step 1: Add a new 'roles' column to store multiple roles as text array
ALTER TABLE public.project_team_members 
ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['team_member'];

-- Step 2: Migrate existing single role to the new roles array
UPDATE public.project_team_members 
SET roles = ARRAY[role]::TEXT[]
WHERE roles = ARRAY['team_member']::TEXT[];

-- Step 3: Update Ravi Singh's password
UPDATE public.users 
SET password = 'ravi123'
WHERE username = 'ravi.singh';

-- Step 4: Update Ravi Singh's roles for each project
-- For Project 1 (EDU-2025-001): project_manager + accountant
UPDATE public.project_team_members 
SET roles = ARRAY['project_manager', 'accountant']::TEXT[]
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'EDU-2025-001' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1);

-- For Project 2 (HLT-2025-002): project_manager + team_member
UPDATE public.project_team_members 
SET roles = ARRAY['project_manager', 'team_member']::TEXT[]
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'HLT-2025-002' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1);

-- For Project 3 (ENV-2025-003): project_manager + admin
UPDATE public.project_team_members 
SET roles = ARRAY['project_manager', 'admin']::TEXT[]
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'ENV-2025-003' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1);

-- For Project 4 (WOM-2025-004): project_manager + accountant
UPDATE public.project_team_members 
SET roles = ARRAY['project_manager', 'accountant']::TEXT[]
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'WOM-2025-004' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1);

-- For Project 5 (DIS-2024-005): project_manager + team_member
UPDATE public.project_team_members 
SET roles = ARRAY['project_manager', 'team_member']::TEXT[]
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'DIS-2024-005' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1);

-- Verification Query
-- SELECT roles, p.project_code, p.name 
-- FROM project_team_members ptm
-- JOIN projects p ON ptm.project_id = p.id
-- WHERE ptm.user_id = (SELECT id FROM users WHERE username = 'ravi.singh')
-- ORDER BY p.project_code;
