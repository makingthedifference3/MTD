-- ============================================================
-- CSR PARTNERS & PROJECTS - SAFE INSERT
-- ============================================================
-- STEP 1: DELETE existing data (if needed) - COMMENT OUT TO KEEP EXISTING DATA
-- DELETE FROM public.projects WHERE csr_partner_id IN ('660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-44665544000b', '660e8400-e29b-41d4-a716-44665544000c');
-- DELETE FROM public.csr_partners WHERE id IN ('660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-44665544000b', '660e8400-e29b-41d4-a716-44665544000c');

-- STEP 2: Insert CSR Partners
INSERT INTO public.csr_partners (id, name, company_name, website, primary_color, is_active, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440004', 'HDFC Bank', 'HDFC Bank', 'hdfcbank.com', '#004c8f', true, NOW()),
('660e8400-e29b-41d4-a716-44665544000b', 'J.P. Morgan', 'J.P. Morgan', 'jpmorgan.com', '#0070ba', true, NOW()),
('660e8400-e29b-41d4-a716-44665544000c', 'Decathlon', 'Decathlon', 'decathlon.in', '#0082c3', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- HDFC BANK - 4 Projects
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'HDFC-PAR-2025', 'Parivartan', 'Holistic rural development and livelihood program', '660e8400-e29b-41d4-a716-446655440004', 'Pune', 'Maharashtra', 'active', '2025-01-01', '2025-12-31', 12000000, 6800000, 15000, 4500, 0, 0, 0, 0, 0, 'emerald', 'Briefcase', true, NOW()),
('990e8400-e29b-41d4-a716-446655440002', 'HDFC-FIN-2025', 'Financial Literacy', 'Banking and finance education for underprivileged communities', '660e8400-e29b-41d4-a716-446655440004', 'Ahmedabad', 'Gujarat', 'active', '2025-02-01', '2025-11-30', 5000000, 2600000, 8000, 2000, 0, 0, 8000, 0, 0, 'blue', 'Wallet', true, NOW()),
('990e8400-e29b-41d4-a716-446655440003', 'HDFC-SWA-2025', 'Swachh Bharat Mission', 'Sanitation and hygiene awareness program', '660e8400-e29b-41d4-a716-446655440004', 'Jaipur', 'Rajasthan', 'active', '2025-03-01', '2025-12-31', 4000000, 2100000, 6000, 1500, 0, 9000, 0, 0, 0, 'pink', 'Droplet', true, NOW()),
('990e8400-e29b-41d4-a716-446655440004', 'HDFC-SHI-2025', 'Shiksha Plus', 'Quality education and school infrastructure development', '660e8400-e29b-41d4-a716-446655440004', 'Mumbai', 'Maharashtra', 'active', '2025-01-15', '2025-12-31', 8000000, 4300000, 5000, 1200, 0, 0, 5000, 0, 12, 'blue', 'GraduationCap', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- J.P. MORGAN - 4 Projects
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('990e8400-e29b-41d4-a716-446655440005', 'JPM-CAR-2025', 'Career Pathways', 'Employment readiness and job placement program', '660e8400-e29b-41d4-a716-44665544000b', 'Mumbai', 'Maharashtra', 'active', '2025-01-05', '2025-12-25', 8000000, 4300000, 10000, 2500, 0, 0, 10000, 0, 0, 'blue', 'Briefcase', true, NOW()),
('990e8400-e29b-41d4-a716-446655440006', 'JPM-GRN-2025', 'Green Finance Initiative', 'Environmental sustainability and climate action awareness', '660e8400-e29b-41d4-a716-44665544000b', 'Bangalore', 'Karnataka', 'active', '2025-02-20', '2025-12-10', 7000000, 3600000, 7000, 2000, 0, 0, 0, 6000, 0, 'green', 'Leaf', true, NOW()),
('990e8400-e29b-41d4-a716-446655440007', 'JPM-FIC-2025', 'Financial Inclusion', 'Microfinance and banking access for women entrepreneurs', '660e8400-e29b-41d4-a716-44665544000b', 'Delhi', 'Delhi', 'active', '2025-03-01', '2025-11-30', 6000000, 3100000, 4500, 1200, 0, 0, 0, 0, 0, 'pink', 'Users', true, NOW()),
('990e8400-e29b-41d4-a716-446655440008', 'JPM-HEA-2025', 'Healthcare Access', 'Mobile health clinics and nutrition support', '660e8400-e29b-41d4-a716-44665544000b', 'Kolkata', 'West Bengal', 'active', '2025-01-20', '2025-12-20', 9000000, 4800000, 12000, 3500, 95000, 0, 0, 0, 0, 'red', 'Heart', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- DECATHLON - 4 Projects
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('990e8400-e29b-41d4-a716-446655440009', 'DEC-SPO-2025', 'Sports For All', 'Community sports development and equipment distribution', '660e8400-e29b-41d4-a716-44665544000c', 'Bangalore', 'Karnataka', 'active', '2025-01-15', '2025-12-15', 5000000, 2700000, 8000, 2000, 0, 0, 0, 0, 0, 'green', 'Activity', true, NOW()),
('990e8400-e29b-41d4-a716-44665544000d', 'DEC-CYC-2025', 'Cycle India Initiative', 'Promote cycling culture and distribute bicycles to students', '660e8400-e29b-41d4-a716-44665544000c', 'Chennai', 'Tamil Nadu', 'active', '2025-02-01', '2025-11-30', 3500000, 1800000, 4000, 1000, 0, 0, 4000, 0, 0, 'emerald', 'Bike', true, NOW()),
('990e8400-e29b-41d4-a716-44665544000e', 'DEC-PLY-2025', 'Play Time Program', 'Creating play areas and sports facilities in schools', '660e8400-e29b-41d4-a716-44665544000c', 'Pune', 'Maharashtra', 'active', '2025-03-01', '2025-12-31', 6000000, 3200000, 6000, 1500, 0, 0, 0, 0, 10, 'orange', 'Users', true, NOW()),
('990e8400-e29b-41d4-a716-44665544000f', 'DEC-FIT-2025', 'Fit Life Movement', 'Fitness training and wellness programs for youth', '660e8400-e29b-41d4-a716-44665544000c', 'Hyderabad', 'Telangana', 'active', '2025-01-10', '2025-12-20', 4500000, 2400000, 5500, 1300, 0, 0, 0, 0, 0, 'purple', 'Heart', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- ADDITIONAL PROJECTS WITH COMPLETED STATUS AND PAD DISTRIBUTION
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('a10e8400-e29b-41d4-a716-446655440010', 'COMP-001-2024', 'Women Empowerment Program', 'Skill development for rural women', '660e8400-e29b-41d4-a716-446655440004', 'Nashik', 'Maharashtra', 'completed', '2024-01-01', '2024-12-31', 3500000, 3500000, 5000, 1000, 0, 150000, 0, 0, 5, 'pink', 'Users', true, NOW()),
('a10e8400-e29b-41d4-a716-446655440011', 'COMP-002-2024', 'Healthcare Initiative 2024', 'Mobile clinics and awareness', '660e8400-e29b-41d4-a716-44665544000b', 'Indore', 'Madhya Pradesh', 'completed', '2024-02-01', '2024-11-30', 4200000, 4200000, 8000, 2000, 150000, 200000, 0, 0, 0, 'red', 'Heart', true, NOW()),
('a10e8400-e29b-41d4-a716-446655440012', 'COMP-003-2024', 'Education Excellence', 'School modernization project', '660e8400-e29b-41d4-a716-44665544000c', 'Lucknow', 'Uttar Pradesh', 'completed', '2024-03-01', '2024-12-15', 5800000, 5800000, 3000, 800, 0, 120000, 6000, 0, 15, 'blue', 'GraduationCap', true, NOW()),
('a10e8400-e29b-41d4-a716-446655440013', 'COMP-004-2024', 'Environmental Drive 2024', 'Tree plantation and conservation', '660e8400-e29b-41d4-a716-446655440004', 'Coimbatore', 'Tamil Nadu', 'completed', '2024-01-15', '2024-10-31', 2500000, 2500000, 2000, 500, 0, 50000, 0, 85000, 0, 'green', 'Leaf', true, NOW()),
('a10e8400-e29b-41d4-a716-446655440014', 'COMP-005-2024', 'Rural Water Project', 'Water access and sanitation', '660e8400-e29b-41d4-a716-44665544000b', 'Aurangabad', 'Maharashtra', 'completed', '2024-02-20', '2024-11-20', 3800000, 3800000, 6000, 1500, 80000, 180000, 0, 0, 8, 'blue', 'Droplet', true, NOW()),
('a10e8400-e29b-41d4-a716-446655440015', 'UPCOMING-001-2025', 'Youth Skills Hub', 'IT and digital literacy training', '660e8400-e29b-41d4-a716-44665544000c', 'Surat', 'Gujarat', 'active', '2025-04-01', '2026-03-31', 6500000, 0, 0, 0, 0, 0, 8000, 0, 0, 'emerald', 'Laptop', true, NOW())
ON CONFLICT (id) DO NOTHING;
