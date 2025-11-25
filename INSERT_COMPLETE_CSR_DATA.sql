-- ============================================================
-- COMPLETE CSR PARTNERS & PROJECTS DATA INSERT SCRIPT
-- ============================================================
-- This script inserts all 46 CSR Partners and their complete project data
-- including beneficiary stats, budgets, and project metrics
-- ============================================================

-- STEP 1: Insert CSR Partners (46 total)
INSERT INTO public.csr_partners (id, name, company_name, website, primary_color, is_active, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Interise', 'Interise Solutions', 'interiseworld.com', '#2563eb', true, NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Tata Mumbai Marathon', 'Tata Consultancy Services', 'tcs.com', '#1a1a1a', true, NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Amazon', 'Amazon', 'amazon.com', '#ff9900', true, NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'HDFC Bank', 'HDFC Bank', 'hdfcbank.com', '#004c8f', true, NOW()),
('660e8400-e29b-41d4-a716-446655440005', 'Aditya Birla Capital', 'Aditya Birla Capital Foundation', 'adityabirla.com', '#8b0000', true, NOW()),
('660e8400-e29b-41d4-a716-446655440006', 'Inorbit', 'Inorbit Malls', 'inorbit.in', '#e31837', true, NOW()),
('660e8400-e29b-41d4-a716-446655440007', 'Fiserv', 'Fiserv', 'fiserv.com', '#ff6600', true, NOW()),
('660e8400-e29b-41d4-a716-446655440008', 'Bureau Veritas', 'Bureau Veritas', 'bureauveritas.com', '#003d7a', true, NOW()),
('660e8400-e29b-41d4-a716-446655440009', 'Enter10 TV Network', 'Enter10 TV Network', 'sonypicturesnetworks.com', '#000000', true, NOW()),
('660e8400-e29b-41d4-a716-44665544000a', 'KASEZ', 'Kandla Special Economic Zone', 'kasez.gov.in', '#ff6600', true, NOW()),
('660e8400-e29b-41d4-a716-44665544000b', 'J.P. Morgan', 'J.P. Morgan', 'jpmorgan.com', '#0070ba', true, NOW()),
('660e8400-e29b-41d4-a716-44665544000c', 'Decathlon', 'Decathlon', 'decathlon.in', '#0082c3', true, NOW()),
('660e8400-e29b-41d4-a716-44665544000d', 'Dahisar Sunteck', 'Sunteck Realty', 'sunteckrealty.com', '#e31e24', true, NOW()),
('660e8400-e29b-41d4-a716-44665544000e', 'PPFAS Mutual Fund', 'PPFAS Mutual Fund', 'ppfas.com', '#003d79', true, NOW()),
('660e8400-e29b-41d4-a716-44665544000f', 'Paytm Insider', 'Paytm Insider', 'insider.in', '#002970', true, NOW()),
('660e8400-e29b-41d4-a716-446655440010', 'ACE Pipeline', 'ACE Pipeline', 'acepipeline.com', '#1a5490', true, NOW()),
('660e8400-e29b-41d4-a716-446655440011', 'JMC Projects', 'JMC Projects India Limited', 'jmcprojects.com', '#ed1c24', true, NOW()),
('660e8400-e29b-41d4-a716-446655440012', 'United Way', 'United Way Mumbai', 'unitedwaymumbai.org', '#ff5a00', true, NOW()),
('660e8400-e29b-41d4-a716-446655440013', 'Kalpataru', 'Kalpataru Limited', 'kalpataru.com', '#8b0304', true, NOW()),
('660e8400-e29b-41d4-a716-446655440014', 'Yash Johar Foundation', 'Yash Johar Foundation', 'dharmaproductions.com', '#000000', true, NOW()),
('660e8400-e29b-41d4-a716-446655440015', 'Ocean Fruit Drink', 'Ocean Fruit Drink', 'oceanspray.com', '#c8102e', true, NOW()),
('660e8400-e29b-41d4-a716-446655440016', 'HDFC ERGO', 'HDFC ERGO', 'hdfcergo.com', '#ed1c24', true, NOW()),
('660e8400-e29b-41d4-a716-446655440017', 'Go Dharmic', 'Go Dharmic', 'godharmic.com', '#ff6600', true, NOW()),
('660e8400-e29b-41d4-a716-446655440018', 'CIAN Agro', 'CIAN Agro Industries & Infrastructure Ltd', 'cianagro.com', '#228b22', true, NOW()),
('660e8400-e29b-41d4-a716-446655440019', 'Dabbawala', 'Mumbai Dabbawala', 'mydabbawala.com', '#ffffff', true, NOW()),
('660e8400-e29b-41d4-a716-44665544001a', 'Metro Wholesale', 'Metro Cash & Carry', 'metro.co.in', '#003d7a', true, NOW()),
('660e8400-e29b-41d4-a716-44665544001b', 'Kiva.ai', 'Kiva.ai', 'kiva.ai', '#6c3', true, NOW()),
('660e8400-e29b-41d4-a716-44665544001c', 'Sunteck Saathi', 'Sunteck Realty', 'sunteckrealty.com', '#e31e24', true, NOW()),
('660e8400-e29b-41d4-a716-44665544001d', 'Seven Eleven', 'Seven Eleven', '7-eleven.com', '#ee3124', true, NOW()),
('660e8400-e29b-41d4-a716-44665544001e', 'Scholastic School', 'Scholastic', 'scholastic.com', '#ed1c24', true, NOW()),
('660e8400-e29b-41d4-a716-44665544001f', 'CRISIL', 'CRISIL Limited', 'crisil.com', '#0066cc', true, NOW()),
('660e8400-e29b-41d4-a716-446655440020', 'TARZ Distribution', 'TARZ Distribution India Pvt Ltd', 'tarz.in', '#000000', true, NOW()),
('660e8400-e29b-41d4-a716-446655440021', 'Raheja Realty', 'Raheja Developers', 'rahejadevelopers.com', '#8b0000', true, NOW()),
('660e8400-e29b-41d4-a716-446655440022', 'Donatekart', 'Donatekart', 'donatekart.com', '#ff6600', true, NOW()),
('660e8400-e29b-41d4-a716-446655440023', 'Dreamz Group', 'Dreamz Group', 'dreamz.co.in', '#4169e1', true, NOW()),
('660e8400-e29b-41d4-a716-446655440024', 'Jeebr', 'Jeebr Internet Services', 'jeebr.com', '#00a859', true, NOW()),
('660e8400-e29b-41d4-a716-446655440025', 'Voice of Slum', 'Voice of Slum', 'voiceofslum.org', '#ff6600', true, NOW()),
('660e8400-e29b-41d4-a716-446655440026', 'CryptoRelief', 'CryptoRelief', 'cryptorelief.in', '#f7931a', true, NOW()),
('660e8400-e29b-41d4-a716-446655440027', 'Ryder Cycles', 'Ryder Cycles', 'rydercycles.com', '#000000', true, NOW()),
('660e8400-e29b-41d4-a716-446655440028', 'Hero Cycles', 'Hero Cycles', 'herocycles.com', '#ed1c24', true, NOW()),
('660e8400-e29b-41d4-a716-446655440029', 'Praja', 'Praja Foundation', 'praja.org', '#ff6600', true, NOW()),
('660e8400-e29b-41d4-a716-44665544002a', 'AVNI', 'AVNI', 'avniproject.org', '#4a90e2', true, NOW()),
('660e8400-e29b-41d4-a716-44665544002b', 'Indinfravit', 'India Infrastructure Trust', 'indinfravit.com', '#003d79', true, NOW()),
('660e8400-e29b-41d4-a716-44665544002c', 'Total Sports & Fitness', 'Total Sports & Fitness', 'totalsportsfitness.com', '#ed1c24', true, NOW()),
('660e8400-e29b-41d4-a716-44665544002d', 'MarketPlace', 'The Daily Convenience Store', 'marketplace.in', '#228b22', true, NOW()),
('660e8400-e29b-41d4-a716-44665544002e', 'eClerx', 'eClerx Services Limited', 'eclerx.com', '#0066cc', true, NOW());

-- STEP 2: Insert Projects for all 46 CSR Partners

-- Interise Solutions Projects (4 projects)
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-int-001', 'LAJJA-2025', 'LAJJA', 'Women Hygiene - Period Stigma ko Dena hai Maat', '660e8400-e29b-41d4-a716-446655440001', 'Mumbai', 'Maharashtra', 'active', '2025-01-01', '2025-12-31', 5000000, 2725000, 12000, 3000, 0, 11000, 0, 0, 0, 'pink', 'Droplet', true, NOW()),
('p-int-002', 'SHOONYA-2025', 'SHOONYA', 'Zero waste management - Recycling, Reusing & Regenerating', '660e8400-e29b-41d4-a716-446655440001', 'Pune', 'Maharashtra', 'active', '2025-02-01', '2025-11-30', 3000000, 1200000, 8500, 2000, 0, 0, 0, 3500, 0, 'emerald', 'Leaf', true, NOW()),
('p-int-003', 'GYAAN-2025', 'GYANDAAN', 'Education - Providing knowledge to the underprivileged', '660e8400-e29b-41d4-a716-446655440001', 'Lucknow', 'Uttar Pradesh', 'active', '2025-03-01', '2025-12-31', 4000000, 1600000, 2800, 500, 0, 0, 2800, 0, 8, 'blue', 'GraduationCap', true, NOW()),
('p-int-004', 'KH-2025', 'KILL HUNGER', 'Health & Hunger - If you can''t feed 100 people then feed just 1', '660e8400-e29b-41d4-a716-446655440001', 'Mumbai', 'Maharashtra', 'active', '2025-01-15', '2025-12-31', 6000000, 3200000, 8500, 2000, 125000, 0, 0, 0, 0, 'red', 'Heart', true, NOW());

-- TCS Marathon Projects (2 projects)
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-tcs-001', 'MTP-2025', 'Marathon Training Program', 'Community running and fitness initiative', '660e8400-e29b-41d4-a716-446655440002', 'Mumbai', 'Maharashtra', 'active', '2025-01-15', '2025-12-15', 8000000, 4500000, 1200, 300, 0, 0, 0, 0, 0, 'emerald', 'Activity', true, NOW()),
('p-tcs-002', 'DLD-2025', 'Digital Literacy Drive', 'IT skills training for underprivileged youth', '660e8400-e29b-41d4-a716-446655440002', 'Bangalore', 'Karnataka', 'active', '2025-02-01', '2025-11-30', 6000000, 3200000, 800, 200, 0, 0, 800, 0, 0, 'blue', 'Laptop', true, NOW());

-- Amazon Projects (2 projects)
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-amz-001', 'AFE-2025', 'Amazon Future Engineer', 'STEM education for rural students', '660e8400-e29b-41d4-a716-446655440003', 'Hyderabad', 'Telangana', 'active', '2025-01-10', '2025-12-20', 10000000, 5500000, 2000, 500, 0, 0, 2000, 0, 0, 'blue', 'GraduationCap', true, NOW()),
('p-amz-002', 'SAH-2025', 'Saheli Program', 'Women entrepreneurship development', '660e8400-e29b-41d4-a716-446655440003', 'Delhi', 'Delhi', 'active', '2025-02-15', '2025-12-31', 7500000, 3800000, 600, 150, 0, 0, 0, 0, 0, 'pink', 'Users', true, NOW());

-- HDFC Bank Projects (2 projects)
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-hdfc-001', 'PAR-2025', 'Parivartan', 'Holistic rural development program', '660e8400-e29b-41d4-a716-446655440004', 'Pune', 'Maharashtra', 'active', '2025-01-01', '2025-12-31', 12000000, 6800000, 3000, 1000, 0, 0, 0, 0, 0, 'emerald', 'Briefcase', true, NOW()),
('p-hdfc-002', 'FINLIT-2025', 'Financial Literacy', 'Banking and finance education', '660e8400-e29b-41d4-a716-446655440004', 'Ahmedabad', 'Gujarat', 'active', '2025-02-01', '2025-11-30', 5000000, 2600000, 1500, 500, 0, 0, 0, 0, 0, 'blue', 'Wallet', true, NOW());

-- Aditya Birla Capital Projects (2 projects)
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-birla-001', 'AV-2025', 'Aditya Vidyalaya', 'Quality education in tribal areas', '660e8400-e29b-41d4-a716-446655440005', 'Nagda', 'Madhya Pradesh', 'active', '2025-01-05', '2025-12-25', 9000000, 4700000, 1800, 400, 0, 0, 1800, 0, 5, 'blue', 'GraduationCap', true, NOW()),
('p-birla-002', 'HCM-2025', 'Healthcare Mission', 'Mobile health clinics in rural areas', '660e8400-e29b-41d4-a716-446655440005', 'Renukoot', 'Uttar Pradesh', 'active', '2025-02-10', '2025-12-20', 8500000, 4200000, 2500, 800, 0, 0, 0, 0, 0, 'red', 'Heart', true, NOW());

-- Inorbit Malls Projects (2 projects)
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-inorbit-001', 'CSH-2025', 'Community Skilling Hub', 'Retail and hospitality training', '660e8400-e29b-41d4-a716-446655440006', 'Hyderabad', 'Telangana', 'active', '2025-01-20', '2025-12-15', 4000000, 2100000, 500, 150, 0, 0, 500, 0, 0, 'emerald', 'Briefcase', true, NOW()),
('p-inorbit-002', 'GSI-2025', 'Green Spaces Initiative', 'Urban gardening and sustainability', '660e8400-e29b-41d4-a716-446655440006', 'Mumbai', 'Maharashtra', 'active', '2025-03-01', '2025-11-30', 3000000, 1400000, 300, 100, 0, 0, 0, 500, 0, 'green', 'Leaf', true, NOW());

-- Fiserv Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-fiserv-001', 'FTE-2025', 'FinTech Education', 'Digital payment literacy program', '660e8400-e29b-41d4-a716-446655440007', 'Pune', 'Maharashtra', 'active', '2025-01-15', '2025-12-10', 5500000, 2900000, 900, 250, 0, 0, 900, 0, 0, 'blue', 'Laptop', true, NOW());

-- Bureau Veritas Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-bv-001', 'SF-2025', 'Safety First', 'Workplace safety training', '660e8400-e29b-41d4-a716-446655440008', 'Chennai', 'Tamil Nadu', 'active', '2025-02-01', '2025-11-30', 4500000, 2300000, 700, 200, 0, 0, 0, 0, 0, 'yellow', 'AlertCircle', true, NOW());

-- Enter10 TV Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-enter10-001', 'MLP-2025', 'Media Literacy Program', 'Digital content creation training', '660e8400-e29b-41d4-a716-446655440009', 'Mumbai', 'Maharashtra', 'active', '2025-01-10', '2025-12-20', 3500000, 1800000, 400, 100, 0, 0, 400, 0, 0, 'purple', 'Camera', true, NOW());

-- KASEZ Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-kasez-001', 'SDZ-2025', 'Skill Development Zone', 'Industrial training for youth', '660e8400-e29b-41d4-a716-44665544000a', 'Kandla', 'Gujarat', 'active', '2025-02-15', '2025-12-15', 6000000, 3100000, 1100, 300, 0, 0, 1100, 0, 0, 'orange', 'Wrench', true, NOW());

-- JP Morgan Projects (2 projects)
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-jpm-001', 'CP-2025', 'Career Pathways', 'Employment readiness program', '660e8400-e29b-41d4-a716-44665544000b', 'Mumbai', 'Maharashtra', 'active', '2025-01-05', '2025-12-25', 8000000, 4300000, 1500, 400, 0, 0, 1500, 0, 0, 'blue', 'Briefcase', true, NOW()),
('p-jpm-002', 'FI-2025', 'Financial Inclusion', 'Microfinance and banking access', '660e8400-e29b-41d4-a716-44665544000b', 'Bangalore', 'Karnataka', 'active', '2025-02-20', '2025-12-10', 7000000, 3600000, 1200, 350, 0, 0, 0, 0, 0, 'green', 'Wallet', true, NOW());

-- Decathlon Projects (2 projects)
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-decathlon-001', 'SFA-2025', 'Sports For All', 'Community sports development', '660e8400-e29b-41d4-a716-44665544000c', 'Bangalore', 'Karnataka', 'active', '2025-01-15', '2025-12-15', 5000000, 2700000, 1000, 300, 0, 0, 0, 0, 0, 'green', 'Activity', true, NOW()),
('p-decathlon-002', 'CI-2025', 'Cycling Initiative', 'Promote cycling culture and fitness', '660e8400-e29b-41d4-a716-44665544000c', 'Chennai', 'Tamil Nadu', 'active', '2025-02-01', '2025-11-30', 3500000, 1800000, 600, 200, 0, 0, 0, 0, 0, 'emerald', 'Bike', true, NOW());

-- Sunteck Realty Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-sunteck-001', 'AHS-2025', 'Affordable Housing Support', 'Housing for underprivileged families', '660e8400-e29b-41d4-a716-44665544000d', 'Mumbai', 'Maharashtra', 'active', '2025-01-10', '2025-12-20', 15000000, 8200000, 500, 150, 0, 0, 0, 0, 0, 'orange', 'Home', true, NOW());

-- PPFAS Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-ppfas-001', 'IL-2025', 'Investment Literacy', 'Financial planning education', '660e8400-e29b-41d4-a716-44665544000e', 'Mumbai', 'Maharashtra', 'active', '2025-02-01', '2025-11-30', 3000000, 1500000, 400, 100, 0, 0, 0, 0, 0, 'blue', 'TrendingUp', true, NOW());

-- Paytm Insider Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-paytm-001', 'ACP-2025', 'Arts & Culture Program', 'Supporting local artists and performers', '660e8400-e29b-41d4-a716-44665544000f', 'Delhi', 'Delhi', 'active', '2025-01-20', '2025-12-15', 4000000, 2100000, 300, 100, 0, 0, 0, 0, 0, 'purple', 'Music', true, NOW());

-- ACE Pipeline Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-ace-001', 'IT-2025', 'Infrastructure Training', 'Technical skills for construction', '660e8400-e29b-41d4-a716-446655440010', 'Jaipur', 'Rajasthan', 'active', '2025-02-10', '2025-12-10', 5000000, 2600000, 800, 250, 0, 0, 800, 0, 0, 'orange', 'Wrench', true, NOW());

-- JMC Projects Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-jmc-001', 'BTA-2025', 'Builder Training Academy', 'Construction skills development', '660e8400-e29b-41d4-a716-446655440011', 'Ahmedabad', 'Gujarat', 'active', '2025-01-15', '2025-12-15', 6000000, 3200000, 1000, 300, 0, 0, 0, 0, 0, 'orange', 'Hammer', true, NOW());

-- United Way Mumbai Projects (2 projects)
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-uw-001', 'CC-2025', 'Community Care', 'Integrated community development', '660e8400-e29b-41d4-a716-446655440012', 'Mumbai', 'Maharashtra', 'active', '2025-01-01', '2025-12-31', 10000000, 5500000, 2500, 800, 50000, 0, 0, 0, 0, 'emerald', 'Users', true, NOW()),
('p-uw-002', 'EE-2025', 'Education Excellence', 'Quality education in slums', '660e8400-e29b-41d4-a716-446655440012', 'Mumbai', 'Maharashtra', 'active', '2025-02-01', '2025-11-30', 7000000, 3700000, 1800, 500, 0, 0, 1800, 0, 5, 'blue', 'GraduationCap', true, NOW());

-- Kalpataru Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-kalpataru-001', 'GBI-2025', 'Green Building Initiative', 'Sustainable construction practices', '660e8400-e29b-41d4-a716-446655440013', 'Pune', 'Maharashtra', 'active', '2025-01-20', '2025-12-20', 8000000, 4200000, 600, 200, 0, 0, 0, 2000, 0, 'green', 'Leaf', true, NOW());

-- Yash Johar Foundation Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-johar-001', 'FET-2025', 'Film & Entertainment Training', 'Entertainment industry skills', '660e8400-e29b-41d4-a716-446655440014', 'Mumbai', 'Maharashtra', 'active', '2025-02-15', '2025-12-10', 5000000, 2600000, 500, 150, 0, 0, 0, 0, 0, 'purple', 'Camera', true, NOW());

-- Ocean Fruit Drink Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-ocean-001', 'NA-2025', 'Nutrition Awareness', 'Health and nutrition education', '660e8400-e29b-41d4-a716-446655440015', 'Kolkata', 'West Bengal', 'active', '2025-01-10', '2025-12-15', 3500000, 1800000, 700, 250, 0, 0, 0, 0, 0, 'orange', 'Apple', true, NOW());

-- HDFC ERGO Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-ergo-001', 'HIA-2025', 'Health Insurance Awareness', 'Insurance literacy program', '660e8400-e29b-41d4-a716-446655440016', 'Mumbai', 'Maharashtra', 'active', '2025-02-01', '2025-11-30', 4000000, 2100000, 900, 300, 0, 0, 0, 0, 0, 'blue', 'Shield', true, NOW());

-- Go Dharmic Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-godharmic-001', 'CHP-2025', 'Cultural Heritage Program', 'Preserving traditional arts', '660e8400-e29b-41d4-a716-446655440017', 'Varanasi', 'Uttar Pradesh', 'active', '2025-01-15', '2025-12-20', 3000000, 1500000, 400, 150, 0, 0, 0, 0, 0, 'purple', 'Music', true, NOW());

-- CIAN Agro Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-cian-001', 'FE-2025', 'Farmer Empowerment', 'Agricultural training and support', '660e8400-e29b-41d4-a716-446655440018', 'Nashik', 'Maharashtra', 'active', '2025-02-10', '2025-12-15', 6000000, 3100000, 1500, 500, 0, 0, 0, 0, 0, 'green', 'Leaf', true, NOW());

-- Mumbai Dabbawala Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-dabbawala-001', 'FST-2025', 'Food Service Training', 'Logistics and delivery skills', '660e8400-e29b-41d4-a716-446655440019', 'Mumbai', 'Maharashtra', 'active', '2025-01-05', '2025-12-25', 2500000, 1300000, 300, 100, 30000, 0, 0, 0, 0, 'orange', 'Truck', true, NOW());

-- Metro Wholesale Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-metro-001', 'RE-2025', 'Retail Excellence', 'Modern retail training', '660e8400-e29b-41d4-a716-44665544001a', 'Bangalore', 'Karnataka', 'active', '2025-02-01', '2025-11-30', 5000000, 2600000, 800, 250, 0, 0, 0, 0, 0, 'emerald', 'ShoppingCart', true, NOW());

-- Kiva.ai Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-kiva-001', 'AI4G-2025', 'AI For Good', 'Artificial intelligence education', '660e8400-e29b-41d4-a716-44665544001b', 'Hyderabad', 'Telangana', 'active', '2025-01-20', '2025-12-15', 7000000, 3700000, 600, 200, 0, 0, 600, 0, 0, 'blue', 'Laptop', true, NOW());

-- Sunteck Saathi Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-saathi-001', 'CB-2025', 'Community Building', 'Neighborhood development program', '660e8400-e29b-41d4-a716-44665544001c', 'Mumbai', 'Maharashtra', 'active', '2025-02-15', '2025-12-10', 4500000, 2300000, 500, 150, 0, 0, 0, 0, 0, 'emerald', 'Users', true, NOW());

-- Seven Eleven Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-711-001', 'QCT-2025', 'Quick Commerce Training', 'Convenience store operations', '660e8400-e29b-41d4-a716-44665544001d', 'Delhi', 'Delhi', 'active', '2025-01-10', '2025-12-20', 3500000, 1800000, 400, 120, 0, 0, 0, 0, 0, 'red', 'ShoppingCart', true, NOW());

-- Scholastic Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-scholastic-001', 'RFA-2025', 'Reading For All', 'Literacy and library program', '660e8400-e29b-41d4-a716-44665544001e', 'Pune', 'Maharashtra', 'active', '2025-02-01', '2025-11-30', 4000000, 2100000, 1000, 350, 0, 0, 1000, 0, 0, 'blue', 'BookOpen', true, NOW());

-- CRISIL Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-crisil-001', 'RAS-2025', 'Rating & Analysis Skills', 'Financial analysis training', '660e8400-e29b-41d4-a716-44665544001f', 'Mumbai', 'Maharashtra', 'active', '2025-01-15', '2025-12-15', 5000000, 2600000, 500, 150, 0, 0, 500, 0, 0, 'blue', 'TrendingUp', true, NOW());

-- TARZ Distribution Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-tarz-001', 'SCA-2025', 'Supply Chain Academy', 'Logistics and distribution training', '660e8400-e29b-41d4-a716-446655440020', 'Ahmedabad', 'Gujarat', 'active', '2025-02-10', '2025-12-10', 3500000, 1800000, 600, 200, 0, 0, 0, 0, 0, 'orange', 'Truck', true, NOW());

-- Raheja Developers Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-raheja-001', 'SCS-2025', 'Smart City Skills', 'Urban planning education', '660e8400-e29b-41d4-a716-446655440021', 'Mumbai', 'Maharashtra', 'active', '2025-01-05', '2025-12-25', 8000000, 4200000, 700, 250, 0, 0, 0, 0, 0, 'blue', 'Building2', true, NOW());

-- Donatekart Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-donate-001', 'CGP-2025', 'Charity & Giving Program', 'Social entrepreneurship training', '660e8400-e29b-41d4-a716-446655440022', 'Bangalore', 'Karnataka', 'active', '2025-02-01', '2025-11-30', 3000000, 1500000, 400, 120, 0, 0, 0, 0, 0, 'green', 'Heart', true, NOW());

-- Dreamz Group Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-dreamz-001', 'IL-2025', 'Innovation Lab', 'Startup and innovation ecosystem', '660e8400-e29b-41d4-a716-446655440023', 'Hyderabad', 'Telangana', 'active', '2025-01-20', '2025-12-15', 6000000, 3100000, 500, 150, 0, 0, 500, 0, 0, 'purple', 'Lightbulb', true, NOW());

-- Jeebr Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-jeebr-001', 'DST-2025', 'Digital Services Training', 'Internet services and e-commerce', '660e8400-e29b-41d4-a716-446655440024', 'Pune', 'Maharashtra', 'active', '2025-02-15', '2025-12-10', 4000000, 2100000, 600, 200, 0, 0, 600, 0, 0, 'blue', 'Laptop', true, NOW());

-- Voice of Slum Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-vos-001', 'SD-2025', 'Slum Development', 'Community development in slums', '660e8400-e29b-41d4-a716-446655440025', 'Mumbai', 'Maharashtra', 'active', '2025-01-10', '2025-12-20', 5000000, 2600000, 1500, 500, 0, 0, 0, 0, 0, 'emerald', 'Home', true, NOW());

-- CryptoRelief Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-crypto-001', 'BE-2025', 'Blockchain Education', 'Cryptocurrency and blockchain training', '660e8400-e29b-41d4-a716-446655440026', 'Bangalore', 'Karnataka', 'active', '2025-02-01', '2025-11-30', 7000000, 3700000, 400, 120, 0, 0, 400, 0, 0, 'yellow', 'Laptop', true, NOW());

-- Ryder Cycles Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-ryder-001', 'CFH-2025', 'Cycling For Health', 'Promoting cycling and fitness', '660e8400-e29b-41d4-a716-446655440027', 'Chennai', 'Tamil Nadu', 'active', '2025-01-15', '2025-12-15', 3000000, 1500000, 500, 180, 0, 0, 0, 0, 0, 'green', 'Bike', true, NOW());

-- Hero Cycles Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-hero-001', 'CMT-2025', 'Cycle Manufacturing Training', 'Technical skills for cycle industry', '660e8400-e29b-41d4-a716-446655440028', 'Ludhiana', 'Punjab', 'active', '2025-02-10', '2025-12-10', 4500000, 2300000, 700, 250, 0, 0, 0, 0, 0, 'red', 'Wrench', true, NOW());

-- Praja Foundation Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-praja-001', 'CE-2025', 'Civic Engagement', 'Citizen participation and governance', '660e8400-e29b-41d4-a716-446655440029', 'Mumbai', 'Maharashtra', 'active', '2025-01-05', '2025-12-25', 3500000, 1800000, 600, 200, 0, 0, 0, 0, 0, 'blue', 'Users', true, NOW());

-- AVNI Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-avni-001', 'HDM-2025', 'Healthcare Data Management', 'Digital health records training', '660e8400-e29b-41d4-a716-44665544002a', 'Pune', 'Maharashtra', 'active', '2025-02-01', '2025-11-30', 5000000, 2600000, 400, 140, 0, 0, 0, 0, 0, 'red', 'Heart', true, NOW());

-- Indinfravit Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-indinfra-001', 'IA-2025', 'Infrastructure Academy', 'Civil engineering training', '660e8400-e29b-41d4-a716-44665544002b', 'Delhi', 'Delhi', 'active', '2025-01-20', '2025-12-15', 9000000, 4700000, 800, 280, 0, 0, 0, 0, 0, 'orange', 'Hammer', true, NOW());

-- Total Sports & Fitness Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-tsf-001', 'FFE-2025', 'Fitness For Everyone', 'Community fitness program', '660e8400-e29b-41d4-a716-44665544002c', 'Mumbai', 'Maharashtra', 'active', '2025-02-15', '2025-12-10', 4000000, 2100000, 900, 300, 0, 0, 0, 0, 0, 'emerald', 'Activity', true, NOW());

-- MarketPlace Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-marketplace-001', 'GRS-2025', 'Grocery & Retail Skills', 'Modern grocery retail training', '660e8400-e29b-41d4-a716-44665544002d', 'Bangalore', 'Karnataka', 'active', '2025-01-10', '2025-12-20', 3500000, 1800000, 500, 170, 0, 0, 0, 0, 0, 'green', 'ShoppingCart', true, NOW());

-- eClerx Project
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, location, state, status, start_date, expected_end_date, total_budget, utilized_budget, direct_beneficiaries, indirect_beneficiaries, meals_served, pads_distributed, students_enrolled, trees_planted, schools_renovated, display_color, display_icon, is_active, created_at) VALUES
('p-eclerx-001', 'DAT-2025', 'Data Analytics Training', 'Data science and analytics skills', '660e8400-e29b-41d4-a716-44665544002e', 'Pune', 'Maharashtra', 'active', '2025-02-01', '2025-11-30', 6000000, 3100000, 700, 230, 0, 0, 700, 0, 0, 'blue', 'Laptop', true, NOW());

-- ============================================================
-- SUMMARY
-- ============================================================
-- Total CSR Partners: 46
-- Total Projects: 56 (distributed across all 46 partners)
-- All projects have complete budget and beneficiary data
-- All projects include color and icon display settings
-- ============================================================
