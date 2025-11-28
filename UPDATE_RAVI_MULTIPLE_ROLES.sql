-- ============================================
-- Update Ravi Singh's Roles - Alternative Approach
-- ============================================

-- Get Ravi Singh's user ID
-- We'll create temp assignments for each additional role

-- First, update password
UPDATE public.users 
SET password = 'ravi123'
WHERE username = 'ravi.singh';

-- For Project 1 (EDU-2025-001): Add ACCOUNTANT role
-- We'll delete the old one and insert both roles
DELETE FROM public.project_team_members 
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'EDU-2025-001' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1)
  AND is_active = true;

-- Insert both roles for Project 1
INSERT INTO public.project_team_members (
  project_id, user_id, role, can_approve_expenses, is_lead, is_active, created_by, updated_by
) VALUES
(
  (SELECT id FROM public.projects WHERE project_code = 'EDU-2025-001' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'project_manager', true, true, true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'EDU-2025-001' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'accountant', true, false, true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
);

-- For Project 2 (HLT-2025-002): Add TEAM_MEMBER role
DELETE FROM public.project_team_members 
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'HLT-2025-002' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1)
  AND is_active = true;

INSERT INTO public.project_team_members (
  project_id, user_id, role, can_approve_expenses, is_lead, is_active, created_by, updated_by
) VALUES
(
  (SELECT id FROM public.projects WHERE project_code = 'HLT-2025-002' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'project_manager', true, true, true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'HLT-2025-002' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'team_member', false, false, true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
);

-- For Project 3 (ENV-2025-003): Add ADMIN role
DELETE FROM public.project_team_members 
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'ENV-2025-003' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1)
  AND is_active = true;

INSERT INTO public.project_team_members (
  project_id, user_id, role, can_approve_expenses, is_lead, is_active, created_by, updated_by
) VALUES
(
  (SELECT id FROM public.projects WHERE project_code = 'ENV-2025-003' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'project_manager', true, true, true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'ENV-2025-003' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'admin', true, true, true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
);

-- For Project 4 (WOM-2025-004): Add ACCOUNTANT role
DELETE FROM public.project_team_members 
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'WOM-2025-004' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1)
  AND is_active = true;

INSERT INTO public.project_team_members (
  project_id, user_id, role, can_approve_expenses, is_lead, is_active, created_by, updated_by
) VALUES
(
  (SELECT id FROM public.projects WHERE project_code = 'WOM-2025-004' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'project_manager', true, true, true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'WOM-2025-004' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'accountant', true, false, true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
);

-- For Project 5 (DIS-2024-005): Add TEAM_MEMBER role
DELETE FROM public.project_team_members 
WHERE project_id = (SELECT id FROM public.projects WHERE project_code = 'DIS-2024-005' LIMIT 1)
  AND user_id = (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1)
  AND is_active = true;

INSERT INTO public.project_team_members (
  project_id, user_id, role, can_approve_expenses, is_lead, is_active, created_by, updated_by
) VALUES
(
  (SELECT id FROM public.projects WHERE project_code = 'DIS-2024-005' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'project_manager', true, true, true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'DIS-2024-005' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'team_member', false, false, true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
);

-- ============================================
-- Verification Query
-- ============================================
-- SELECT ptm.role, p.project_code, p.name 
-- FROM project_team_members ptm
-- JOIN projects p ON ptm.project_id = p.id
-- WHERE ptm.user_id = (SELECT id FROM users WHERE username = 'ravi.singh')
-- ORDER BY p.project_code;
