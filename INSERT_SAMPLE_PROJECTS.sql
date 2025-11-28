-- ============================================
-- Sample Projects for MTD Dashboard
-- ============================================

-- First, get the user IDs (these will be auto-populated after users are created)
-- We'll use the usernames to reference them

-- Insert CSR Partners (if not exists)
INSERT INTO public.csr_partners (name, company_name, city, state, website, budget_allocated, is_active)
VALUES 
  ('TCS Foundation', 'TCS Foundation', 'Mumbai', 'Maharashtra', 'https://www.tcs.com/foundation', 5000000, true),
  ('Infosys Foundation', 'Infosys Foundation', 'Bangalore', 'Karnataka', 'https://www.infosys.com/foundation', 3000000, true),
  ('Wipro Foundation', 'Wipro Foundation', 'Bangalore', 'Karnataka', 'https://www.wipro.com/foundation', 2500000, true)
ON CONFLICT DO NOTHING;

-- Insert Projects with different statuses and roles
INSERT INTO public.projects (
  project_code,
  name,
  description,
  csr_partner_id,
  project_manager_id,
  status,
  start_date,
  expected_end_date,
  total_budget,
  utilized_budget,
  impact_metrics,
  created_by,
  updated_by
) VALUES

-- Project 1: Education Initiative (Active) - PM: Ravi Singh
(
  'EDU-2025-001',
  'Digital Literacy Program - Mumbai',
  'Comprehensive digital literacy training for underprivileged youth in Mumbai slums',
  (SELECT id FROM public.csr_partners WHERE company_name = 'TCS Foundation' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'active',
  '2025-01-15'::date,
  '2025-12-31'::date,
  1500000,
  450000,
  '[{"metric": "students_trained", "value": 250}, {"metric": "centers_opened", "value": 5}, {"metric": "completion_rate", "value": 85}]'::jsonb,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),

-- Project 2: Health & Wellness (Active) - PM: Ravi Singh
(
  'HLT-2025-002',
  'Community Health Awareness Campaign',
  'Health checkups and awareness camps in rural Maharashtra',
  (SELECT id FROM public.csr_partners WHERE company_name = 'Infosys Foundation' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'active',
  '2025-02-01'::date,
  '2025-11-30'::date,
  800000,
  320000,
  '[{"metric": "beneficiaries", "value": 5000}, {"metric": "camps_conducted", "value": 12}, {"metric": "health_issues_identified", "value": 1200}]'::jsonb,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),

-- Project 3: Environment Protection (On Hold) - PM: Ravi Singh
(
  'ENV-2025-003',
  'Tree Plantation & Environmental Conservation',
  'Large-scale tree plantation and environmental awareness in urban areas',
  (SELECT id FROM public.csr_partners WHERE company_name = 'Wipro Foundation' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'on_hold',
  '2025-03-15'::date,
  '2025-09-30'::date,
  600000,
  150000,
  '[{"metric": "trees_planted", "value": 5000}, {"metric": "volunteers_engaged", "value": 300}]'::jsonb,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),

-- Project 4: Women Empowerment (Active) - PM: Ravi Singh
(
  'WOM-2025-004',
  'Skill Development for Women',
  'Vocational training and skill development programs for women in underserved communities',
  (SELECT id FROM public.csr_partners WHERE company_name = 'TCS Foundation' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'active',
  '2025-01-20'::date,
  '2025-08-31'::date,
  950000,
  380000,
  '[{"metric": "women_trained", "value": 150}, {"metric": "employment_rate", "value": 72}, {"metric": "centers", "value": 3}]'::jsonb,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),

-- Project 5: Disaster Relief (Completed) - PM: Ravi Singh
(
  'DIS-2024-005',
  'Flood Relief & Rehabilitation',
  'Emergency relief and rehabilitation after recent floods',
  (SELECT id FROM public.csr_partners WHERE company_name = 'Infosys Foundation' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'ravi.singh' LIMIT 1),
  'completed',
  '2024-08-15'::date,
  '2024-11-30'::date,
  1200000,
  1200000,
  '[{"metric": "families_helped", "value": 800}, {"metric": "shelter_provided", "value": 500}, {"metric": "relief_kits", "value": 1000}]'::jsonb,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
)
ON CONFLICT (project_code) DO NOTHING;

-- ============================================
-- Assign Team Members to Projects
-- ============================================

-- Project 1: Digital Literacy - Team: Ravi (PM), Priya (Field), Amit (Data)
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
  'project_manager',
  true,
  true,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'EDU-2025-001' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'priya.patil' LIMIT 1),
  'team_member',
  false,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'EDU-2025-001' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'amit.shah' LIMIT 1),
  'team_member',
  false,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'EDU-2025-001' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'meena.iyer' LIMIT 1),
  'accountant',
  true,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Project 2: Health Campaign - Team: Ravi (PM), Priya (Field), Meena (Accountant)
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
  'project_manager',
  true,
  true,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'HLT-2025-002' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'priya.patil' LIMIT 1),
  'team_member',
  false,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'HLT-2025-002' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'meena.iyer' LIMIT 1),
  'accountant',
  true,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Project 3: Environment - Team: Ravi (PM), Amit (Data)
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
  'project_manager',
  true,
  true,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'ENV-2025-003' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'amit.shah' LIMIT 1),
  'team_member',
  false,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Project 4: Women Empowerment - Team: Ravi (PM), Priya (Field), Meena (Accountant), Amit (Data)
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
  'project_manager',
  true,
  true,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'WOM-2025-004' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'priya.patil' LIMIT 1),
  'team_member',
  false,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'WOM-2025-004' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'meena.iyer' LIMIT 1),
  'accountant',
  true,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'WOM-2025-004' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'amit.shah' LIMIT 1),
  'team_member',
  false,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Project 5: Disaster Relief - Team: Ravi (PM), Priya (Field), Meena (Accountant)
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
  'project_manager',
  true,
  true,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'DIS-2024-005' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'priya.patil' LIMIT 1),
  'team_member',
  false,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
),
(
  (SELECT id FROM public.projects WHERE project_code = 'DIS-2024-005' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'meena.iyer' LIMIT 1),
  'accountant',
  true,
  false,
  true,
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1),
  (SELECT id FROM public.users WHERE username = 'suresh.menon' LIMIT 1)
)
ON CONFLICT (project_id, user_id) DO NOTHING;
