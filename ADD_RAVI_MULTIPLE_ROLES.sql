-- ============================================
-- Add Ravi Singh with Multiple Roles in Different Projects
-- ============================================

-- First, update Ravi Singh's password to ravi123
UPDATE public.users 
SET password = 'ravi123'
WHERE username = 'ravi.singh';

-- Add Ravi as ACCOUNTANT in Project 1 (Digital Literacy) - in addition to existing PM role
INSERT INTO public.project_team_members (
  project_id,
  user_id,
  role,
  can_approve_expenses,
  is_lead,
  is_active,
  created_by,
  updated_by
) VALUES
(
  (SELECT id FROM public.projects WHERE project_code = 'EDU-2025-001' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'accountant',
  true,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Add Ravi as TEAM MEMBER in Project 2 (Health Campaign) - different role than PM
INSERT INTO public.project_team_members (
  project_id,
  user_id,
  role,
  can_approve_expenses,
  is_lead,
  is_active,
  created_by,
  updated_by
) VALUES
(
  (SELECT id FROM public.projects WHERE project_code = 'HLT-2025-002' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'team_member',
  false,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Add Ravi as ADMIN in Project 3 (Environment) - different role than PM
INSERT INTO public.project_team_members (
  project_id,
  user_id,
  role,
  can_approve_expenses,
  is_lead,
  is_active,
  created_by,
  updated_by
) VALUES
(
  (SELECT id FROM public.projects WHERE project_code = 'ENV-2025-003' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'admin',
  true,
  true,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Add Ravi as ACCOUNTANT in Project 4 (Women Empowerment) - different role than PM
INSERT INTO public.project_team_members (
  project_id,
  user_id,
  role,
  can_approve_expenses,
  is_lead,
  is_active,
  created_by,
  updated_by
) VALUES
(
  (SELECT id FROM public.projects WHERE project_code = 'WOM-2025-004' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'accountant',
  true,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Add Ravi as TEAM MEMBER in Project 5 (Disaster Relief) - different role than PM
INSERT INTO public.project_team_members (
  project_id,
  user_id,
  role,
  can_approve_expenses,
  is_lead,
  is_active,
  created_by,
  updated_by
) VALUES
(
  (SELECT id FROM public.projects WHERE project_code = 'DIS-2024-005' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'team_member',
  false,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- ============================================
-- Summary of Ravi Singh's Roles
-- ============================================
-- EDU-2025-001: PROJECT_MANAGER (existing) + ACCOUNTANT (new)
-- HLT-2025-002: PROJECT_MANAGER (existing) + TEAM_MEMBER (new)
-- ENV-2025-003: PROJECT_MANAGER (existing) + ADMIN (new)
-- WOM-2025-004: PROJECT_MANAGER (existing) + ACCOUNTANT (new)
-- DIS-2024-005: PROJECT_MANAGER (existing) + TEAM_MEMBER (new)
