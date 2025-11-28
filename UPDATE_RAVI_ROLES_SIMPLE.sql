-- ============================================
-- Update Ravi Singh's Roles - Using Array Field
-- ============================================

-- First, update password
UPDATE public.users 
SET password = 'ravi123'
WHERE username = 'ravi.singh';

-- For Project 1 (EDU-2025-001): Update to have multiple roles
UPDATE public.project_team_members 
SET role = 'project_manager,accountant'
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'EDU-2025-001' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1);

-- For Project 2 (HLT-2025-002): Update to have multiple roles
UPDATE public.project_team_members 
SET role = 'project_manager,team_member'
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'HLT-2025-002' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1);

-- For Project 3 (ENV-2025-003): Update to have multiple roles
UPDATE public.project_team_members 
SET role = 'project_manager,admin'
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'ENV-2025-003' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1);

-- For Project 4 (WOM-2025-004): Update to have multiple roles
UPDATE public.project_team_members 
SET role = 'project_manager,accountant'
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'WOM-2025-004' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1);

-- For Project 5 (DIS-2024-005): Update to have multiple roles
UPDATE public.project_team_members 
SET role = 'project_manager,team_member'
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'DIS-2024-005' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1);

-- Verification Query
-- SELECT role, p.project_code, p.name 
-- FROM project_team_members ptm
-- JOIN projects p ON ptm.project_id = p.id
-- WHERE ptm.user_id = (SELECT id FROM users WHERE username = 'ravi.singh')
-- ORDER BY p.project_code;
