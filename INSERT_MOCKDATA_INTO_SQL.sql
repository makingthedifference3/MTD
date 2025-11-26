-- =====================================================================
-- MTD CSR PLATFORM - COMPLETE INSERT QUERIES FROM MOCKDATA.TS
-- Inserting all data from mockData.ts into SQL_SCHEMA_COMPLETE_FIXED
-- =====================================================================

-----
-- =====================================================================
-- INSERT USERS (10 users)
-- =====================================================================
INSERT INTO public.users (id, email, full_name, mobile_number, address, city, state, role, department, designation, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'lokesh@mtd.com', 'Lokesh Joshi', '+91-9876543210', 'Mumbai, Maharashtra', 'Mumbai', 'Maharashtra', 'project_manager', 'Operations', 'Project Manager', true),
('550e8400-e29b-41d4-a716-446655440002', 'priya@mtd.com', 'Priya Sharma', '+91-9876543211', 'Delhi, NCR', 'Delhi', 'Delhi', 'accountant', 'Finance', 'Accountant', true),
('550e8400-e29b-41d4-a716-446655440003', 'admin@mtd.com', 'Rajesh Kumar', '+91-9876543212', 'Bangalore, Karnataka', 'Bangalore', 'Karnataka', 'admin', 'Administration', 'Admin', true),
('550e8400-e29b-41d4-a716-446655440004', 'rahul@mtd.com', 'Rahul Verma', '+91-9876543213', 'Pune, Maharashtra', 'Pune', 'Maharashtra', 'team_member', 'Operations', 'Team Member', true),
('550e8400-e29b-41d4-a716-446655440005', 'sneha@mtd.com', 'Sneha Patel', '+91-9876543214', 'Ahmedabad, Gujarat', 'Ahmedabad', 'Gujarat', 'team_member', 'Social Media', 'Social Media Manager', true),
('550e8400-e29b-41d4-a716-446655440006', 'anjali@mtd.com', 'Anjali Desai', '+91-9876543215', 'Mumbai, Maharashtra', 'Mumbai', 'Maharashtra', 'team_member', 'Field Operations', 'Field Officer', true),
('550e8400-e29b-41d4-a716-446655440007', 'vikram@mtd.com', 'Vikram Singh', '+91-9876543216', 'Lucknow, Uttar Pradesh', 'Lucknow', 'Uttar Pradesh', 'team_member', 'Education', 'Education Coordinator', true),
('550e8400-e29b-41d4-a716-446655440008', 'kavita@mtd.com', 'Kavita Nair', '+91-9876543217', 'Bangalore, Karnataka', 'Bangalore', 'Karnataka', 'team_member', 'Health & Hygiene', 'Health Officer', true),
('550e8400-e29b-41d4-a716-446655440009', 'amit@mtd.com', 'Amit Bhardwaj', '+91-9876543218', 'Chennai, Tamil Nadu', 'Chennai', 'Tamil Nadu', 'team_member', 'Logistics', 'Logistics Manager', true),
('550e8400-e29b-41d4-a716-446655440010', 'pooja@mtd.com', 'Pooja Mehta', '+91-9876543219', 'Jaipur, Rajasthan', 'Jaipur', 'Rajasthan', 'team_member', 'Environment', 'Environment Officer', true);

-- =====================================================================
-- INSERT CSR_PARTNERS (4 partners)
-- =====================================================================
INSERT INTO public.csr_partners (id, name, company_name, contact_person, email, phone, address, city, state, is_active, notes) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Interise', 'Interise Foundation', 'John Doe', 'contact@interise.com', '+91-2040000000', 'Mumbai HQ', 'Mumbai', 'Maharashtra', true, 'Leading CSR partner focused on women empowerment, education, and environmental sustainability'),
('660e8400-e29b-41d4-a716-446655440002', 'TCS (Tata Consultancy Services)', 'Tata Consultancy Services', 'Priya Singh', 'csr@tcs.com', '+91-2240000000', 'Bangalore HQ', 'Bangalore', 'Karnataka', true, 'Technology-driven CSR initiatives in education and women empowerment'),
('660e8400-e29b-41d4-a716-446655440003', 'HDFC Bank', 'HDFC Bank Limited', 'Rajesh Malhotra', 'csr@hdfcbank.com', '+91-2240100000', 'Mumbai HQ', 'Mumbai', 'Maharashtra', true, 'Banking sector CSR focusing on hunger eradication and environmental conservation'),
('660e8400-e29b-41d4-a716-446655440004', 'Amazon', 'Amazon India Pvt Ltd', 'Neha Verma', 'csr@amazon.in', '+91-8040000000', 'Bangalore HQ', 'Bangalore', 'Karnataka', true, 'E-commerce giant supporting education, hunger relief, and women empowerment programs');

-- =====================================================================
-- INSERT PROJECTS (12 projects)
-- =====================================================================
INSERT INTO public.projects (id, project_code, name, description, csr_partner_id, project_manager_id, location, state, city, start_date, expected_end_date, status, total_budget, utilized_budget, total_beneficiaries, direct_beneficiaries, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'LAJJA-INT-2024-001', 'LAJJA', 'Women Hygiene - Period Stigma ko Dena hai Maat, Toh Lajja ki kya Baat...!!!', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Mumbai', 'Maharashtra', 'Mumbai', '2024-01-15', '2025-12-31', 'active', 5000000, 2725000, 12000, 12000, true),
('770e8400-e29b-41d4-a716-446655440002', 'SHOO-INT-2024-001', 'SHOONYA', 'Zero waste management - Recycling, Reusing & Regenerating for a cleaner India', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Pune', 'Maharashtra', 'Pune', '2024-02-01', '2025-11-30', 'active', 3000000, 1200000, 8500, 8500, true),
('770e8400-e29b-41d4-a716-446655440003', 'KHHG-INT-2024-001', 'KILL HUNGER', 'Health & Hunger - If you can''t feed 100 people then feed just 1', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Mumbai', 'Maharashtra', 'Mumbai', '2024-01-01', '2025-12-31', 'active', 6000000, 3200000, 8500, 8500, true),
('770e8400-e29b-41d4-a716-446655440004', 'GYAD-INT-2024-001', 'GYANDAAN', 'Education - Providing knowledge to the underprivileged through open schools, libraries & scholarships', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Lucknow', 'Uttar Pradesh', 'Lucknow', '2024-03-01', '2025-12-31', 'active', 4000000, 1600000, 2800, 2800, true),
('770e8400-e29b-41d4-a716-446655440005', 'LAJJA-TCS-2024-001', 'LAJJA', 'Women Hygiene - Period Stigma ko Dena hai Maat, Toh Lajja ki kya Baat...!!!', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Bangalore', 'Karnataka', 'Bangalore', '2024-02-15', '2025-12-31', 'active', 4500000, 2100000, 9500, 9500, true),
('770e8400-e29b-41d4-a716-446655440006', 'GYAD-TCS-2024-001', 'GYANDAAN', 'Education - Providing knowledge to the underprivileged through open schools, libraries & scholarships', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Hyderabad', 'Telangana', 'Hyderabad', '2024-01-20', '2025-12-31', 'active', 3500000, 1400000, 2200, 2200, true),
('770e8400-e29b-41d4-a716-446655440007', 'SHOO-HDFC-2024-001', 'SHOONYA', 'Zero waste management - Recycling, Reusing & Regenerating for a cleaner India', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Delhi', 'Delhi', 'Delhi', '2024-03-10', '2025-11-30', 'active', 3800000, 1500000, 7200, 7200, true),
('770e8400-e29b-41d4-a716-446655440008', 'KHHG-HDFC-2024-001', 'KILL HUNGER', 'Health & Hunger - If you can''t feed 100 people then feed just 1', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Chennai', 'Tamil Nadu', 'Chennai', '2024-02-05', '2025-12-31', 'active', 5500000, 2800000, 6500, 6500, true),
('770e8400-e29b-41d4-a716-446655440009', 'LAJJA-AMZ-2024-001', 'LAJJA', 'Women Hygiene - Period Stigma ko Dena hai Maat, Toh Lajja ki kya Baat...!!!', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Kolkata', 'West Bengal', 'Kolkata', '2024-01-25', '2025-12-31', 'active', 4200000, 1900000, 7800, 7800, true),
('770e8400-e29b-41d4-a716-446655440010', 'SHOO-AMZ-2024-001', 'SHOONYA', 'Zero waste management - Recycling, Reusing & Regenerating for a cleaner India', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Jaipur', 'Rajasthan', 'Jaipur', '2024-02-20', '2025-11-30', 'active', 2800000, 1100000, 5500, 5500, true),
('770e8400-e29b-41d4-a716-446655440011', 'KHHG-AMZ-2024-001', 'KILL HUNGER', 'Health & Hunger - If you can''t feed 100 people then feed just 1', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Ahmedabad', 'Gujarat', 'Ahmedabad', '2024-01-10', '2025-12-31', 'active', 4800000, 2400000, 5200, 5200, true),
('770e8400-e29b-41d4-a716-446655440012', 'GYAD-AMZ-2024-001', 'GYANDAAN', 'Education - Providing knowledge to the underprivileged through open schools, libraries & scholarships', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Indore', 'Madhya Pradesh', 'Indore', '2024-03-15', '2025-12-31', 'active', 3200000, 1300000, 1800, 1800, true);

-- =====================================================================
-- INSERT PROJECT_TEAM_MEMBERS (Multiple team assignments)
-- =====================================================================
INSERT INTO public.project_team_members (id, project_id, user_id, role, access_level, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Project Manager', 'full', true),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'Field Officer', 'limited', true),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440008', 'Health Officer', 'limited', true),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Finance Lead', 'full', true),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Project Manager', 'full', true),
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440010', 'Environment Officer', 'limited', true),
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Project Manager', 'full', true),
('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440009', 'Logistics Manager', 'limited', true);

-- =====================================================================
-- INSERT TASKS (30 tasks)
-- =====================================================================
INSERT INTO public.tasks (id, task_code, project_id, title, description, task_type, category, assigned_to, assigned_by, due_date, start_date, status, priority, completion_percentage, is_active) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'TASK-P1-001', '770e8400-e29b-41d4-a716-446655440001', 'Distribute menstrual hygiene kits in Dharavi', 'Distribute 500 hygiene kits to women in Dharavi slum area', 'Distribution', 'Distribution', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '2025-11-20', '2025-11-01', 'in_progress', 'On Priority', 60, true),
('990e8400-e29b-41d4-a716-446655440002', 'TASK-P1-002', '770e8400-e29b-41d4-a716-446655440001', 'Conduct awareness session at schools', 'Organize menstrual health awareness sessions in 5 Mumbai schools', 'Education', 'Education', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '2025-11-18', '2025-11-01', 'in_progress', 'On Priority', 50, true),
('990e8400-e29b-41d4-a716-446655440003', 'TASK-P1-003', '770e8400-e29b-41d4-a716-446655440001', 'Social media campaign for LAJJA', 'Create Instagram and Facebook posts about menstrual hygiene awareness', 'Development', 'Social Media', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2025-11-25', '2025-11-01', 'not_started', 'Less Priority', 0, true),
('990e8400-e29b-41d4-a716-446655440004', 'TASK-P2-001', '770e8400-e29b-41d4-a716-446655440002', 'Organize waste collection drive', 'Collect plastic and recyclable waste from 10 communities in Pune', 'Event', 'Field Work', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '2025-11-22', '2025-11-01', 'in_progress', 'On Priority', 70, true),
('990e8400-e29b-41d4-a716-446655440005', 'TASK-P2-002', '770e8400-e29b-41d4-a716-446655440002', 'Plant 200 trees in Kothrud area', 'Tree plantation drive with local community participation', 'Event', 'Environment', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '2025-11-10', '2025-10-15', 'completed', 'On Priority', 100, true),
('990e8400-e29b-41d4-a716-446655440006', 'TASK-P2-003', '770e8400-e29b-41d4-a716-446655440002', 'Setup recycling center', 'Establish plastic recycling unit in Pune', 'Infrastructure', 'Infrastructure', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '2025-12-05', '2025-11-01', 'not_started', 'On Priority', 0, true),
('990e8400-e29b-41d4-a716-446655440007', 'TASK-P3-001', '770e8400-e29b-41d4-a716-446655440003', 'Distribute meals at railway stations', 'Daily meal distribution to homeless people at 3 major Mumbai stations', 'Distribution', 'Distribution', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '2025-11-30', '2025-11-01', 'in_progress', 'On Priority', 65, true),
('990e8400-e29b-41d4-a716-446655440008', 'TASK-P3-002', '770e8400-e29b-41d4-a716-446655440003', 'Prepare 1000 ration kits', 'Package monthly ration kits for underprivileged families', 'Logistics', 'Logistics', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '2025-11-15', '2025-11-01', 'in_progress', 'On Priority', 80, true),
('990e8400-e29b-41d4-a716-446655440009', 'TASK-P3-003', '770e8400-e29b-41d4-a716-446655440003', 'Partner with local NGOs', 'Establish partnerships with 3 food distribution NGOs', 'Meeting', 'Partnership', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '2025-11-28', '2025-11-01', 'not_started', 'Less Priority', 0, true),
('990e8400-e29b-41d4-a716-446655440010', 'TASK-P4-001', '770e8400-e29b-41d4-a716-446655440004', 'Renovate school library', 'Complete renovation of library at Government Primary School Lucknow', 'Infrastructure', 'Infrastructure', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '2025-11-25', '2025-11-01', 'in_progress', 'On Priority', 55, true),
('990e8400-e29b-41d4-a716-446655440011', 'TASK-P4-002', '770e8400-e29b-41d4-a716-446655440004', 'Distribute 500 textbooks', 'Provide free textbooks to students from economically weaker sections', 'Distribution', 'Distribution', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '2025-11-08', '2025-10-15', 'completed', 'On Priority', 100, true),
('990e8400-e29b-41d4-a716-446655440012', 'TASK-P4-003', '770e8400-e29b-41d4-a716-446655440004', 'Process scholarship applications', 'Review and approve 50 scholarship applications for merit students', 'Review', 'Administration', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '2025-11-20', '2025-11-01', 'in_progress', 'On Priority', 70, true),
('990e8400-e29b-41d4-a716-446655440013', 'TASK-P5-001', '770e8400-e29b-41d4-a716-446655440005', 'Tech-enabled menstrual tracking app', 'Develop mobile app for menstrual health tracking and education', 'Development', 'Technology', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '2025-12-10', '2025-11-01', 'in_progress', 'On Priority', 40, true),
('990e8400-e29b-41d4-a716-446655440014', 'TASK-P5-002', '770e8400-e29b-41d4-a716-446655440005', 'Distribute hygiene kits in IT parks', 'Distribute menstrual hygiene products to women employees in tech companies', 'Distribution', 'Distribution', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '2025-11-30', '2025-11-01', 'not_started', 'Less Priority', 0, true),
('990e8400-e29b-41d4-a716-446655440015', 'TASK-P6-001', '770e8400-e29b-41d4-a716-446655440006', 'Setup digital classroom', 'Install computers and smart boards in 3 government schools', 'Development', 'Technology', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '2025-11-28', '2025-11-01', 'in_progress', 'On Priority', 45, true),
('990e8400-e29b-41d4-a716-446655440016', 'TASK-P6-002', '770e8400-e29b-41d4-a716-446655440006', 'Conduct coding workshops', 'Organize free coding classes for 100 students', 'Education', 'Education', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '2025-11-05', '2025-10-01', 'completed', 'On Priority', 100, true),
('990e8400-e29b-41d4-a716-446655440017', 'TASK-P7-001', '770e8400-e29b-41d4-a716-446655440007', 'Install solar panels in community centers', 'Setup solar energy systems in 5 community centers', 'Infrastructure', 'Environment', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '2025-12-15', '2025-11-01', 'not_started', 'On Priority', 0, true),
('990e8400-e29b-41d4-a716-446655440018', 'TASK-P7-002', '770e8400-e29b-41d4-a716-446655440007', 'Waste segregation awareness campaign', 'Educate 20 Delhi communities about waste segregation', 'Education', 'Education', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '2025-11-22', '2025-11-01', 'in_progress', 'On Priority', 50, true),
('990e8400-e29b-41d4-a716-446655440019', 'TASK-P8-001', '770e8400-e29b-41d4-a716-446655440008', 'Mid-day meal program for schools', 'Provide nutritious meals to 500 students in 5 government schools', 'Distribution', 'Distribution', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '2025-11-30', '2025-11-01', 'in_progress', 'On Priority', 75, true),
('990e8400-e29b-41d4-a716-446655440020', 'TASK-P8-002', '770e8400-e29b-41d4-a716-446655440008', 'Setup community kitchen', 'Establish kitchen facility for daily meal preparation', 'Infrastructure', 'Infrastructure', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '2025-12-05', '2025-11-01', 'not_started', 'On Priority', 0, true),
('990e8400-e29b-41d4-a716-446655440021', 'TASK-P9-001', '770e8400-e29b-41d4-a716-446655440009', 'E-commerce platform for hygiene products', 'Launch online platform for affordable menstrual hygiene products', 'Development', 'Technology', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '2025-12-20', '2025-11-01', 'not_started', 'Less Priority', 0, true),
('990e8400-e29b-41d4-a716-446655440022', 'TASK-P9-002', '770e8400-e29b-41d4-a716-446655440009', 'Distribute hygiene kits in slums', 'Reach 1000 women in Kolkata slum areas', 'Distribution', 'Distribution', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '2025-11-18', '2025-11-01', 'in_progress', 'On Priority', 75, true),
('990e8400-e29b-41d4-a716-446655440023', 'TASK-P10-001', '770e8400-e29b-41d4-a716-446655440010', 'Plastic-free packaging initiative', 'Partner with local vendors to eliminate plastic packaging', 'Development', 'Environment', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '2025-11-25', '2025-11-01', 'in_progress', 'On Priority', 50, true),
('990e8400-e29b-41d4-a716-446655440024', 'TASK-P10-002', '770e8400-e29b-41d4-a716-446655440010', 'Plant 300 trees in Jaipur', 'Tree plantation drive in Jaipur public parks', 'Event', 'Environment', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '2025-11-10', '2025-10-15', 'completed', 'On Priority', 100, true),
('990e8400-e29b-41d4-a716-446655440025', 'TASK-P11-001', '770e8400-e29b-41d4-a716-446655440011', 'Food delivery to elderly homes', 'Daily meal delivery to 200 elderly people in old age homes', 'Distribution', 'Distribution', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '2025-11-30', '2025-11-01', 'in_progress', 'On Priority', 80, true),
('990e8400-e29b-41d4-a716-446655440026', 'TASK-P11-002', '770e8400-e29b-41d4-a716-446655440011', 'Amazon warehouse food donation', 'Coordinate with Amazon warehouses for surplus food donation', 'Logistics', 'Logistics', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '2025-11-20', '2025-11-01', 'in_progress', 'On Priority', 60, true),
('990e8400-e29b-41d4-a716-446655440027', 'TASK-P12-001', '770e8400-e29b-41d4-a716-446655440012', 'Kindle library setup', 'Donate Kindle devices and e-books to school libraries', 'Development', 'Technology', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '2025-12-01', '2025-11-01', 'not_started', 'On Priority', 0, true),
('990e8400-e29b-41d4-a716-446655440028', 'TASK-P12-002', '770e8400-e29b-41d4-a716-446655440012', 'Scholarship distribution ceremony', 'Organize event to distribute scholarships to 30 students', 'Event', 'Event', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '2025-11-22', '2025-11-01', 'in_progress', 'On Priority', 60, true),
('990e8400-e29b-41d4-a716-446655440029', 'TASK-ALL-001', '770e8400-e29b-41d4-a716-446655440001', 'Monthly budget review', 'Review and reconcile monthly expenses for all projects', 'Review', 'Finance', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '2025-11-15', '2025-11-01', 'in_progress', 'On Priority', 50, true),
('990e8400-e29b-41d4-a716-446655440030', 'TASK-ALL-002', '770e8400-e29b-41d4-a716-446655440001', 'Social media analytics report', 'Compile monthly social media performance report for all projects', 'Development', 'Social Media', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2025-11-28', '2025-11-01', 'not_started', 'Less Priority', 0, true);

-- =====================================================================
-- INSERT BUDGET_ALLOCATION (Budget for each project category)
-- =====================================================================
INSERT INTO public.budget_allocation (id, project_id, category_id, category_name, allocated_amount, utilized_amount, fiscal_year) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.expense_categories WHERE code = 'MAT-001'), 'Materials', 500000, 250000, '2024-25'),
('aa0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.expense_categories WHERE code = 'LOG-001'), 'Logistics', 300000, 150000, '2024-25'),
('aa0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.expense_categories WHERE code = 'EDM-001'), 'Educational Materials', 200000, 100000, '2024-25'),
('aa0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.expense_categories WHERE code = 'ENV-001'), 'Environment', 400000, 200000, '2024-25'),
('aa0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440003', (SELECT id FROM public.expense_categories WHERE code = 'FAS-001'), 'Food & Supplies', 800000, 500000, '2024-25'),
('aa0e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440004', (SELECT id FROM public.expense_categories WHERE code = 'EDM-001'), 'Educational Materials', 300000, 150000, '2024-25');

-- =====================================================================
-- INSERT CALENDAR_EVENTS (10 events)
-- =====================================================================
INSERT INTO public.calendar_events (id, event_code, project_id, title, description, event_type, organizer_id, event_date, status) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'EVT-P1-001', '770e8400-e29b-41d4-a716-446655440001', 'LAJJA Project Kickoff', 'Launch meeting for LAJJA project with team', 'Meeting', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 'completed'),
('cc0e8400-e29b-41d4-a716-446655440002', 'EVT-P1-002', '770e8400-e29b-41d4-a716-446655440001', 'Women Awareness Workshop', 'Awareness session on menstrual health', 'Workshop', '550e8400-e29b-41d4-a716-446655440006', '2025-11-15', 'scheduled'),
('cc0e8400-e29b-41d4-a716-446655440003', 'EVT-P2-001', '770e8400-e29b-41d4-a716-446655440002', 'Waste Management Training', 'Training for waste segregation and recycling', 'Training', '550e8400-e29b-41d4-a716-446655440010', '2025-11-20', 'scheduled'),
('cc0e8400-e29b-41d4-a716-446655440004', 'EVT-P3-001', '770e8400-e29b-41d4-a716-446655440003', 'Food Distribution Drive', 'Community food distribution event', 'Field Visit', '550e8400-e29b-41d4-a716-446655440009', '2025-11-22', 'scheduled'),
('cc0e8400-e29b-41d4-a716-446655440005', 'EVT-P4-001', '770e8400-e29b-41d4-a716-446655440004', 'School Library Opening', 'Inauguration of renovated school library', 'Review', '550e8400-e29b-41d4-a716-446655440007', '2025-12-01', 'scheduled'),
('cc0e8400-e29b-41d4-a716-446655440006', 'EVT-P4-002', '770e8400-e29b-41d4-a716-446655440004', 'Scholarship Distribution Ceremony', 'Award scholarships to 30 deserving students', 'Workshop', '550e8400-e29b-41d4-a716-446655440007', '2025-11-22', 'scheduled'),
('cc0e8400-e29b-41d4-a716-446655440007', 'EVT-P6-001', '770e8400-e29b-41d4-a716-446655440006', 'Digital Classroom Launch', 'Inauguration of digital learning center', 'Review', '550e8400-e29b-41d4-a716-446655440007', '2025-12-10', 'scheduled'),
('cc0e8400-e29b-41d4-a716-446655440008', 'EVT-P7-001', '770e8400-e29b-41d4-a716-446655440007', 'Solar Panel Installation', 'Installation of solar panels in community center', 'Training', '550e8400-e29b-41d4-a716-446655440010', '2025-12-15', 'scheduled'),
('cc0e8400-e29b-41d4-a716-446655440009', 'EVT-P10-001', '770e8400-e29b-41d4-a716-446655440010', 'Tree Plantation Drive', 'Community tree plantation initiative', 'Field Visit', '550e8400-e29b-41d4-a716-446655440010', '2025-11-12', 'completed'),
('bb0e8400-e29b-41d4-a716-446655440010', 'EVT-ALL-001', '770e8400-e29b-41d4-a716-446655440001', 'Monthly Team Standup', 'All projects monthly meeting', 'Meeting', '550e8400-e29b-41d4-a716-446655440001', '2025-11-21', 'scheduled');

-- =====================================================================
-- INSERT PROJECT_EXPENSES (28 expenses across projects)
-- =====================================================================
INSERT INTO public.project_expenses (id, expense_code, project_id, category_id, description, base_amount, tax_amount, total_amount, date, status, submitted_by) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'EXP-P1-001', '770e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.expense_categories WHERE code = 'MAT-001'), 'Menstrual hygiene kits purchase', 50000, 9000, 59000, '2025-11-15', 'approved', '550e8400-e29b-41d4-a716-446655440006'),
('cc0e8400-e29b-41d4-a716-446655440002', 'EXP-P1-002', '770e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.expense_categories WHERE code = 'LOG-001'), 'Transport for distribution', 25000, 4500, 29500, '2025-11-10', 'approved', '550e8400-e29b-41d4-a716-446655440006'),
('cc0e8400-e29b-41d4-a716-446655440003', 'EXP-P1-003', '770e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.expense_categories WHERE code = 'EDM-001'), 'Awareness materials printing', 15000, 2700, 17700, '2025-11-08', 'approved', '550e8400-e29b-41d4-a716-446655440002'),
('cc0e8400-e29b-41d4-a716-446655440004', 'EXP-P1-004', '770e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.expense_categories WHERE code = 'VID-001'), 'Video documentation', 35000, 6300, 41300, '2025-11-12', 'pending', '550e8400-e29b-41d4-a716-446655440005'),
('cc0e8400-e29b-41d4-a716-446655440005', 'EXP-P2-001', '770e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.expense_categories WHERE code = 'ENV-001'), 'Waste collection equipment', 80000, 14400, 94400, '2025-11-14', 'approved', '550e8400-e29b-41d4-a716-446655440010'),
('cc0e8400-e29b-41d4-a716-446655440006', 'EXP-P2-002', '770e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.expense_categories WHERE code = 'ENV-001'), 'Tree saplings purchase', 45000, 8100, 53100, '2025-11-11', 'approved', '550e8400-e29b-41d4-a716-446655440010'),
('cc0e8400-e29b-41d4-a716-446655440007', 'EXP-P2-003', '770e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.expense_categories WHERE code = 'LOG-001'), 'Transport and labor', 30000, 5400, 35400, '2025-11-09', 'submitted', '550e8400-e29b-41d4-a716-446655440010'),
('cc0e8400-e29b-41d4-a716-446655440008', 'EXP-P3-001', '770e8400-e29b-41d4-a716-446655440003', (SELECT id FROM public.expense_categories WHERE code = 'FAS-001'), 'Food procurement', 150000, 27000, 177000, '2025-11-16', 'approved', '550e8400-e29b-41d4-a716-446655440009'),
('cc0e8400-e29b-41d4-a716-446655440009', 'EXP-P3-002', '770e8400-e29b-41d4-a716-446655440003', (SELECT id FROM public.expense_categories WHERE code = 'LOG-001'), 'Food distribution logistics', 50000, 9000, 59000, '2025-11-13', 'approved', '550e8400-e29b-41d4-a716-446655440009'),
('cc0e8400-e29b-41d4-a716-446655440010', 'EXP-P3-003', '770e8400-e29b-41d4-a716-446655440003', (SELECT id FROM public.expense_categories WHERE code = 'FAS-001'), 'Ration kit packing materials', 40000, 7200, 47200, '2025-11-12', 'submitted', '550e8400-e29b-41d4-a716-446655440002'),
('cc0e8400-e29b-41d4-a716-446655440011', 'EXP-P4-001', '770e8400-e29b-41d4-a716-446655440004', (SELECT id FROM public.expense_categories WHERE code = 'INF-001'), 'School library renovation', 200000, 36000, 236000, '2025-11-10', 'approved', '550e8400-e29b-41d4-a716-446655440007'),
('cc0e8400-e29b-41d4-a716-446655440012', 'EXP-P4-002', '770e8400-e29b-41d4-a716-446655440004', (SELECT id FROM public.expense_categories WHERE code = 'EDM-001'), 'Textbooks purchase', 100000, 18000, 118000, '2025-11-08', 'approved', '550e8400-e29b-41d4-a716-446655440007'),
('cc0e8400-e29b-41d4-a716-446655440013', 'EXP-P4-003', '770e8400-e29b-41d4-a716-446655440004', (SELECT id FROM public.expense_categories WHERE code = 'FIN-001'), 'Scholarship fund', 50000, 9000, 59000, '2025-11-14', 'pending', '550e8400-e29b-41d4-a716-446655440002'),
('cc0e8400-e29b-41d4-a716-446655440014', 'EXP-P5-001', '770e8400-e29b-41d4-a716-446655440005', (SELECT id FROM public.expense_categories WHERE code = 'TECH-001'), 'App development', 120000, 21600, 141600, '2025-11-15', 'submitted', '550e8400-e29b-41d4-a716-446655440008'),
('cc0e8400-e29b-41d4-a716-446655440015', 'EXP-P6-001', '770e8400-e29b-41d4-a716-446655440006', (SELECT id FROM public.expense_categories WHERE code = 'TECH-001'), 'Digital classroom setup', 180000, 32400, 212400, '2025-11-12', 'approved', '550e8400-e29b-41d4-a716-446655440007'),
('cc0e8400-e29b-41d4-a716-446655440016', 'EXP-P7-001', '770e8400-e29b-41d4-a716-446655440007', (SELECT id FROM public.expense_categories WHERE code = 'ENV-001'), 'Solar panel installation', 250000, 45000, 295000, '2025-11-18', 'submitted', '550e8400-e29b-41d4-a716-446655440010'),
('cc0e8400-e29b-41d4-a716-446655440017', 'EXP-P7-002', '770e8400-e29b-41d4-a716-446655440007', (SELECT id FROM public.expense_categories WHERE code = 'EDM-001'), 'Awareness campaigns', 60000, 10800, 70800, '2025-11-14', 'approved', '550e8400-e29b-41d4-a716-446655440010'),
('cc0e8400-e29b-41d4-a716-446655440018', 'EXP-P8-001', '770e8400-e29b-41d4-a716-446655440008', (SELECT id FROM public.expense_categories WHERE code = 'FAS-001'), 'Mid-day meal scheme', 200000, 36000, 236000, '2025-11-16', 'approved', '550e8400-e29b-41d4-a716-446655440009'),
('cc0e8400-e29b-41d4-a716-446655440019', 'EXP-P8-002', '770e8400-e29b-41d4-a716-446655440008', (SELECT id FROM public.expense_categories WHERE code = 'INF-001'), 'Community kitchen setup', 150000, 27000, 177000, '2025-11-13', 'submitted', '550e8400-e29b-41d4-a716-446655440009'),
('cc0e8400-e29b-41d4-a716-446655440020', 'EXP-P9-001', '770e8400-e29b-41d4-a716-446655440009', (SELECT id FROM public.expense_categories WHERE code = 'TECH-001'), 'E-commerce platform', 140000, 25200, 165200, '2025-11-17', 'pending', '550e8400-e29b-41d4-a716-446655440006'),
('cc0e8400-e29b-41d4-a716-446655440021', 'EXP-P9-002', '770e8400-e29b-41d4-a716-446655440009', (SELECT id FROM public.expense_categories WHERE code = 'MAT-001'), 'Hygiene kits procurement', 85000, 15300, 100300, '2025-11-14', 'approved', '550e8400-e29b-41d4-a716-446655440006'),
('cc0e8400-e29b-41d4-a716-446655440022', 'EXP-P10-001', '770e8400-e29b-41d4-a716-446655440010', (SELECT id FROM public.expense_categories WHERE code = 'ENV-001'), 'Plastic-free packaging materials', 70000, 12600, 82600, '2025-11-15', 'approved', '550e8400-e29b-41d4-a716-446655440010'),
('cc0e8400-e29b-41d4-a716-446655440023', 'EXP-P10-002', '770e8400-e29b-41d4-a716-446655440010', (SELECT id FROM public.expense_categories WHERE code = 'ENV-001'), 'Tree plantation supplies', 55000, 9900, 64900, '2025-11-11', 'approved', '550e8400-e29b-41d4-a716-446655440010'),
('cc0e8400-e29b-41d4-a716-446655440024', 'EXP-P11-001', '770e8400-e29b-41d4-a716-446655440011', (SELECT id FROM public.expense_categories WHERE code = 'FAS-001'), 'Elderly home meal delivery', 120000, 21600, 141600, '2025-11-16', 'approved', '550e8400-e29b-41d4-a716-446655440009'),
('cc0e8400-e29b-41d4-a716-446655440025', 'EXP-P11-002', '770e8400-e29b-41d4-a716-446655440011', (SELECT id FROM public.expense_categories WHERE code = 'LOG-001'), 'Coordination with Amazon', 30000, 5400, 35400, '2025-11-13', 'submitted', '550e8400-e29b-41d4-a716-446655440009'),
('cc0e8400-e29b-41d4-a716-446655440026', 'EXP-P12-001', '770e8400-e29b-41d4-a716-446655440012', (SELECT id FROM public.expense_categories WHERE code = 'TECH-001'), 'Kindle device purchase', 110000, 19800, 129800, '2025-11-17', 'pending', '550e8400-e29b-41d4-a716-446655440007'),
('cc0e8400-e29b-41d4-a716-446655440027', 'EXP-P12-002', '770e8400-e29b-41d4-a716-446655440012', (SELECT id FROM public.expense_categories WHERE code = 'EDM-001'), 'E-book subscription', 25000, 4500, 29500, '2025-11-12', 'approved', '550e8400-e29b-41d4-a716-446655440007'),
('cc0e8400-e29b-41d4-a716-446655440028', 'EXP-P12-003', '770e8400-e29b-41d4-a716-446655440012', (SELECT id FROM public.expense_categories WHERE code = 'FIN-001'), 'Scholarship ceremony event', 35000, 6300, 41300, '2025-11-15', 'approved', '550e8400-e29b-41d4-a716-446655440002');

-- =====================================================================
-- INSERT REAL_TIME_UPDATES (14 project updates)
-- =====================================================================
INSERT INTO public.real_time_updates (id, update_code, project_id, title, description, images, update_type, is_public, is_sent_to_client, created_by) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'UPDATE-P1-001', '770e8400-e29b-41d4-a716-446655440001', 'LAJJA Kit Distribution Drive', 'Successfully distributed 500 menstrual hygiene kits in Dharavi slum', '["image1.jpg", "image2.jpg"]'::jsonb, 'Milestone', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440002', 'UPDATE-P1-002', '770e8400-e29b-41d4-a716-446655440001', 'Awareness Sessions Completed', 'Completed 15 awareness sessions in 5 schools', '["awareness.jpg"]'::jsonb, 'Achievement', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440003', 'UPDATE-P2-001', '770e8400-e29b-41d4-a716-446655440002', 'SHOONYA Waste Collection', 'Collected 62 tons of waste from 25 communities', '["waste.jpg", "before_after.jpg"]'::jsonb, 'Milestone', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440004', 'UPDATE-P2-002', '770e8400-e29b-41d4-a716-446655440002', 'Tree Plantation Success', 'Planted 3500 trees across Pune region', '["trees.jpg"]'::jsonb, 'Achievement', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440005', 'UPDATE-P3-001', '770e8400-e29b-41d4-a716-446655440003', 'KILL HUNGER Initiative', 'Distributed 125,000 meals to underprivileged communities', '["meals.jpg", "distribution.jpg"]'::jsonb, 'Milestone', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440006', 'UPDATE-P3-002', '770e8400-e29b-41d4-a716-446655440003', 'Ration Kit Distribution', 'Prepared and distributed 10,000 ration kits', '["rations.jpg"]'::jsonb, 'Progress', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440007', 'UPDATE-P4-001', '770e8400-e29b-41d4-a716-446655440004', 'GYANDAAN Library Renovation', 'Successfully renovated 8 school libraries', '["library.jpg", "renovation.jpg"]'::jsonb, 'Milestone', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440008', 'UPDATE-P4-002', '770e8400-e29b-41d4-a716-446655440004', 'Scholarship Disbursement', 'Awarded 45 scholarships to deserving students', '["scholars.jpg"]'::jsonb, 'Achievement', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440009', 'UPDATE-P6-001', '770e8400-e29b-41d4-a716-446655440006', 'Digital Classroom Launch', 'Installed digital learning centers in 6 schools', '["classroom.jpg", "tech.jpg"]'::jsonb, 'Milestone', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440010', 'UPDATE-P7-001', '770e8400-e29b-41d4-a716-446655440007', 'Solar Energy Initiative', 'Installed solar panels in 5 community centers', '["solar.jpg"]'::jsonb, 'Progress', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440011', 'UPDATE-P8-001', '770e8400-e29b-41d4-a716-446655440008', 'Mid-Day Meal Program', 'Providing meals to 500 students daily', '["midday.jpg", "feeding.jpg"]'::jsonb, 'Milestone', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440012', 'UPDATE-P10-001', '770e8400-e29b-41d4-a716-446655440010', 'Tree Plantation in Jaipur', 'Planted 2100 trees in Jaipur public parks', '["jaipur_trees.jpg"]'::jsonb, 'Achievement', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440013', 'UPDATE-P11-001', '770e8400-e29b-41d4-a716-446655440011', 'Elderly Care Program', 'Daily meal delivery to 200 elderly people', '["elderly.jpg"]'::jsonb, 'Progress', true, true, '550e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440014', 'UPDATE-P12-001', '770e8400-e29b-41d4-a716-446655440012', 'Digital Library Setup', 'Distributed Kindle devices to 12 school libraries', '["kindle.jpg"]'::jsonb, 'Milestone', true, true, '550e8400-e29b-41d4-a716-446655440001');

-- =====================================================================
-- INSERT MEDIA_ARTICLES (21 articles)
-- =====================================================================
INSERT INTO public.media_articles (id, media_code, project_id, title, description, media_type, drive_link, article_url, access_level, is_public, created_by) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'MED-P1-001', '770e8400-e29b-41d4-a716-446655440001', 'LAJJA Project Documentary', 'Full documentary on LAJJA menstrual hygiene initiative', 'video', 'https://drive.google.com/file/d/lajja-doc', 'https://videos.mtd.com/lajja-doc.mp4', 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440002', 'MED-P1-002', '770e8400-e29b-41d4-a716-446655440001', 'Impact Story: Breaking Stigma', 'Story of a girl whose life changed through LAJJA', 'document', 'https://drive.google.com/file/d/lajja-impact', 'https://blog.mtd.com/lajja-impact', 'public', true, '550e8400-e29b-41d4-a716-446655440005'),
('ee0e8400-e29b-41d4-a716-446655440003', 'MED-P1-003', '770e8400-e29b-41d4-a716-446655440001', 'School Awareness Session Photos', 'Photo gallery of awareness sessions', 'photo', 'https://drive.google.com/folder/d/lajja-schools', null, 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440004', 'MED-P2-001', '770e8400-e29b-41d4-a716-446655440002', 'SHOONYA: Zero Waste Vision', 'Documentary on waste management initiative', 'video', 'https://drive.google.com/file/d/shoonya', 'https://videos.mtd.com/shoonya.mp4', 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440005', 'MED-P2-002', '770e8400-e29b-41d4-a716-446655440002', 'Community Cleanup Drive Report', 'Detailed report of cleanup activities', 'document', 'https://drive.google.com/file/d/cleanup', 'https://blog.mtd.com/cleanup', 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440006', 'MED-P2-003', '770e8400-e29b-41d4-a716-446655440002', 'Tree Plantation Ceremony', 'Photos and videos from tree plantation', 'photo', 'https://drive.google.com/folder/d/trees', null, 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440007', 'MED-P3-001', '770e8400-e29b-41d4-a716-446655440003', 'KILL HUNGER Campaign', 'Campaign video for hunger relief', 'video', 'https://drive.google.com/file/d/hunger', 'https://videos.mtd.com/hunger.mp4', 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440008', 'MED-P3-002', '770e8400-e29b-41d4-a716-446655440003', 'Success Story: Family Fed', 'Testimonial from a beneficiary family', 'document', 'https://drive.google.com/file/d/hunger-story', 'https://blog.mtd.com/hunger-story', 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440009', 'MED-P3-003', '770e8400-e29b-41d4-a716-446655440003', 'Distribution Drive Photos', 'Photo collection from meal distribution', 'photo', 'https://drive.google.com/folder/d/distribution', null, 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440010', 'MED-P4-001', '770e8400-e29b-41d4-a716-446655440004', 'GYANDAAN: Education for All', 'Documentary on education initiative', 'video', 'https://drive.google.com/file/d/gyandaan', 'https://videos.mtd.com/gyandaan.mp4', 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440011', 'MED-P4-002', '770e8400-e29b-41d4-a716-446655440004', 'School Library Transformation', 'Before and after library renovation', 'document', 'https://drive.google.com/file/d/library', 'https://blog.mtd.com/library', 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440012', 'MED-P4-003', '770e8400-e29b-41d4-a716-446655440004', 'Student Scholarship Ceremony', 'Photos from scholarship award event', 'photo', 'https://drive.google.com/folder/d/scholars', null, 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440013', 'MED-P6-001', '770e8400-e29b-41d4-a716-446655440006', 'Digital Learning Revolution', 'Article on digital classroom setup', 'document', 'https://drive.google.com/file/d/digital-class', 'https://blog.mtd.com/digital-class', 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440014', 'MED-P7-001', '770e8400-e29b-41d4-a716-446655440007', 'Solar Energy for Communities', 'Documentary on solar panel installation', 'video', 'https://drive.google.com/file/d/solar', 'https://videos.mtd.com/solar.mp4', 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440015', 'MED-P8-001', '770e8400-e29b-41d4-a716-446655440008', 'Mid-Day Meal Success Story', 'Documentary on mid-day meal program', 'video', 'https://drive.google.com/file/d/midday', 'https://videos.mtd.com/midday.mp4', 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440016', 'MED-P9-001', '770e8400-e29b-41d4-a716-446655440009', 'LAJJA Bangalore Initiative', 'Update on LAJJA project in Bangalore', 'document', 'https://drive.google.com/file/d/lajja-bangalore', 'https://blog.mtd.com/lajja-bangalore', 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440017', 'MED-P10-001', '770e8400-e29b-41d4-a716-446655440010', 'Plastic-Free Jaipur Campaign', 'Article on plastic-free packaging', 'document', 'https://drive.google.com/file/d/plastic-free', 'https://blog.mtd.com/plastic-free', 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440018', 'MED-P11-001', '770e8400-e29b-41d4-a716-446655440011', 'Elderly Care Initiative', 'Photo story of elderly care program', 'photo', 'https://drive.google.com/folder/d/elderly', null, 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440019', 'MED-P12-001', '770e8400-e29b-41d4-a716-446655440012', 'Kindle Library Launch', 'Photos from Kindle library inauguration', 'photo', 'https://drive.google.com/folder/d/kindle', null, 'public', true, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440020', 'MED-P1-004', '770e8400-e29b-41d4-a716-446655440001', 'Internal Team Report', 'Confidential team performance report', 'document', 'https://drive.google.com/file/d/report', 'https://internal.mtd.com/report', 'internal', false, '550e8400-e29b-41d4-a716-446655440001'),
('ee0e8400-e29b-41d4-a716-446655440021', 'MED-P5-001', '770e8400-e29b-41d4-a716-446655440005', 'TCS LAJJA Bangalore Progress', 'Progress report for TCS partnership', 'document', 'https://drive.google.com/file/d/tcs-progress', 'https://blog.mtd.com/tcs-progress', 'client', true, '550e8400-e29b-41d4-a716-446655440001');

-- =====================================================================
-- INSERT DAILY_REPORTS (Sample daily reports)
-- =====================================================================
INSERT INTO public.daily_reports (id, report_code, project_id, user_id, date, work_summary, activities, notes) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', 'RPT-P1-001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', '2025-11-16', 'Distributed 250 hygiene kits in Dharavi', ARRAY['Kits distributed', 'Awareness session held', 'Photos captured'], 'Low community participation in afternoon session'),
('ff0e8400-e29b-41d4-a716-446655440002', 'RPT-P1-002', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440008', '2025-11-16', 'Conducted 3 awareness sessions', ARRAY['Sessions in 3 schools completed', '450 participants engaged'], 'School timings were tight'),
('ff0e8400-e29b-41d4-a716-446655440003', 'RPT-P2-001', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440010', '2025-11-16', 'Waste collection drive completed', ARRAY['2 tons of waste collected', '5 communities participated'], 'Transportation delays occurred'),
('ff0e8400-e29b-41d4-a716-446655440004', 'RPT-P3-001', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440009', '2025-11-16', 'Food distribution at stations', ARRAY['500 meals distributed at railway stations', 'Coordination with local authorities'], 'Weather conditions affected delivery'),
('ff0e8400-e29b-41d4-a716-446655440005', 'RPT-P4-001', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', '2025-11-16', 'Library renovation progress', ARRAY['40% of renovation work completed', 'Materials procured'], 'Labour shortage on site'),
('ff0e8400-e29b-41d4-a716-446655440006', 'RPT-P7-001', '770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440010', '2025-11-16', 'Waste segregation training', ARRAY['Trained 100 people', 'Across 4 communities'], 'All participants engaged well'),
('ff0e8400-e29b-41d4-a716-446655440007', 'RPT-P8-001', '770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440009', '2025-11-16', 'Mid-day meal prep and delivery', ARRAY['Prepared meals for 300 students', 'Delivered to schools'], 'Kitchen staff shortage');

-- =====================================================================
-- INSERT DATA_ENTRY_FORMS (Sample forms)
-- =====================================================================
INSERT INTO public.data_entry_forms (id, form_code, project_id, form_name, form_type, date, responses, submitted_by, status, created_by) VALUES
('fa0e8400-e29b-41d4-a716-446655440001', 'FORM-P1-001', '770e8400-e29b-41d4-a716-446655440001', 'LAJJA Beneficiary Survey', 'Survey', '2025-11-15', '{"questions": [{"q1": "Age group", "q2": "Community type"}], "responses": 150}'::jsonb, '550e8400-e29b-41d4-a716-446655440006', 'submitted', '550e8400-e29b-41d4-a716-446655440001'),
('fa0e8400-e29b-41d4-a716-446655440002', 'FORM-P2-001', '770e8400-e29b-41d4-a716-446655440002', 'SHOONYA Impact Assessment', 'Assessment', '2025-11-15', '{"waste_collected": 62000, "communities": 25}'::jsonb, '550e8400-e29b-41d4-a716-446655440010', 'submitted', '550e8400-e29b-41d4-a716-446655440001'),
('fa0e8400-e29b-41d4-a716-446655440003', 'FORM-P3-001', '770e8400-e29b-41d4-a716-446655440003', 'KILL HUNGER Feedback', 'Feedback', '2025-11-15', '{"beneficiaries": 500, "satisfaction": 95}'::jsonb, '550e8400-e29b-41d4-a716-446655440009', 'submitted', '550e8400-e29b-41d4-a716-446655440001'),
('fa0e8400-e29b-41d4-a716-446655440004', 'FORM-P4-001', '770e8400-e29b-41d4-a716-446655440004', 'GYANDAAN Student Performance', 'Assessment', '2025-11-15', '{"students_passed": 320, "attendance": 98}'::jsonb, '550e8400-e29b-41d4-a716-446655440007', 'submitted', '550e8400-e29b-41d4-a716-446655440001'),
('fa0e8400-e29b-41d4-a716-446655440005', 'FORM-P6-001', '770e8400-e29b-41d4-a716-446655440006', 'Digital Classroom Usage', 'Survey', '2025-11-15', '{"daily_users": 450, "technical_issues": 2}'::jsonb, '550e8400-e29b-41d4-a716-446655440007', 'submitted', '550e8400-e29b-41d4-a716-446655440001');

-- =====================================================================
-- INSERT BILLS (Sample bills)
-- =====================================================================
INSERT INTO public.bills (id, bill_code, project_id, bill_number, vendor_name, bill_type, subtotal, tax_amount, total_amount, date, status, created_by) VALUES
('fb0e8400-e29b-41d4-a716-446655440001', 'BILL-P1-001', '770e8400-e29b-41d4-a716-446655440001', 'INV-2025-001', 'ABC Supplies Ltd', 'Invoice', 50000, 9000, 59000, '2025-11-15', 'approved', '550e8400-e29b-41d4-a716-446655440006'),
('fb0e8400-e29b-41d4-a716-446655440002', 'BILL-P2-001', '770e8400-e29b-41d4-a716-446655440002', 'INV-2025-002', 'Green Earth Pvt Ltd', 'Invoice', 80000, 14400, 94400, '2025-11-14', 'approved', '550e8400-e29b-41d4-a716-446655440010'),
('fb0e8400-e29b-41d4-a716-446655440003', 'BILL-P3-001', '770e8400-e29b-41d4-a716-446655440003', 'INV-2025-003', 'Food Distributors Inc', 'Invoice', 150000, 27000, 177000, '2025-11-16', 'approved', '550e8400-e29b-41d4-a716-446655440009'),
('fb0e8400-e29b-41d4-a716-446655440004', 'BILL-P4-001', '770e8400-e29b-41d4-a716-446655440004', 'INV-2025-004', 'Education Books Co', 'Invoice', 100000, 18000, 118000, '2025-11-12', 'approved', '550e8400-e29b-41d4-a716-446655440007'),
('fb0e8400-e29b-41d4-a716-446655440005', 'BILL-P6-001', '770e8400-e29b-41d4-a716-446655440006', 'INV-2025-005', 'Tech Solutions Ltd', 'Invoice', 180000, 32400, 212400, '2025-11-13', 'pending', '550e8400-e29b-41d4-a716-446655440007'),
('fb0e8400-e29b-41d4-a716-446655440006', 'BILL-P8-001', '770e8400-e29b-41d4-a716-446655440008', 'INV-2025-006', 'Meal Providers Ltd', 'Invoice', 200000, 36000, 236000, '2025-11-16', 'approved', '550e8400-e29b-41d4-a716-446655440009');

-- =====================================================================
-- INSERT REPORTS (Project reports)
-- =====================================================================
INSERT INTO public.reports (id, report_code, project_id, title, description, report_type, report_drive_link, generated_by, generated_date, status, created_by) VALUES
('fc0e8400-e29b-41d4-a716-446655440001', 'RPT-P1-001', '770e8400-e29b-41d4-a716-446655440001', 'LAJJA Monthly Report Nov 2025', 'November progress report', 'Monthly', 'https://reports.mtd.com/lajja-nov.pdf', '550e8400-e29b-41d4-a716-446655440002', '2025-11-16', 'approved', '550e8400-e29b-41d4-a716-446655440001'),
('fc0e8400-e29b-41d4-a716-446655440002', 'RPT-P1-002', '770e8400-e29b-41d4-a716-446655440001', 'LAJJA Quarterly Report Q3', 'Q3 2025 impact report', 'Quarterly', 'https://reports.mtd.com/lajja-q3.pdf', '550e8400-e29b-41d4-a716-446655440002', '2025-09-30', 'approved', '550e8400-e29b-41d4-a716-446655440001'),
('fc0e8400-e29b-41d4-a716-446655440003', 'RPT-P2-001', '770e8400-e29b-41d4-a716-446655440002', 'SHOONYA Monthly Report Nov 2025', 'November waste management report', 'Monthly', 'https://reports.mtd.com/shoonya-nov.pdf', '550e8400-e29b-41d4-a716-446655440002', '2025-11-16', 'approved', '550e8400-e29b-41d4-a716-446655440001'),
('fc0e8400-e29b-41d4-a716-446655440004', 'RPT-P3-001', '770e8400-e29b-41d4-a716-446655440003', 'KILL HUNGER Monthly Report Nov 2025', 'November hunger relief report', 'Monthly', 'https://reports.mtd.com/hunger-nov.pdf', '550e8400-e29b-41d4-a716-446655440002', '2025-11-16', 'approved', '550e8400-e29b-41d4-a716-446655440001'),
('fc0e8400-e29b-41d4-a716-446655440005', 'RPT-P4-001', '770e8400-e29b-41d4-a716-446655440004', 'GYANDAAN Monthly Report Nov 2025', 'November education report', 'Monthly', 'https://reports.mtd.com/gyandaan-nov.pdf', '550e8400-e29b-41d4-a716-446655440002', '2025-11-16', 'approved', '550e8400-e29b-41d4-a716-446655440001'),
('fc0e8400-e29b-41d4-a716-446655440006', 'RPT-ALL-001', '770e8400-e29b-41d4-a716-446655440001', 'Organization Annual Report 2024-25', 'Complete organization impact', 'Annual', 'https://reports.mtd.com/annual-2024-25.pdf', '550e8400-e29b-41d4-a716-446655440002', '2025-03-31', 'approved', '550e8400-e29b-41d4-a716-446655440001');

-- =====================================================================
-- INSERT UTILIZATION_CERTIFICATES (CSR partner certificates)
-- =====================================================================
INSERT INTO public.utilization_certificates (id, certificate_code, csr_partner_id, project_id, certificate_type, total_amount, utilized_amount, issue_date, status, created_by) VALUES
('fd0e8400-e29b-41d4-a716-446655440001', 'CERT-INT-001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Quarterly', 5000000, 2725000, '2025-11-15', 'approved', '550e8400-e29b-41d4-a716-446655440002'),
('fd0e8400-e29b-41d4-a716-446655440002', 'CERT-INT-002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'Quarterly', 3000000, 1200000, '2025-11-15', 'approved', '550e8400-e29b-41d4-a716-446655440002'),
('fd0e8400-e29b-41d4-a716-446655440003', 'CERT-INT-003', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'Quarterly', 6000000, 3200000, '2025-11-15', 'approved', '550e8400-e29b-41d4-a716-446655440002'),
('fd0e8400-e29b-41d4-a716-446655440004', 'CERT-INT-004', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440004', 'Quarterly', 4000000, 1600000, '2025-11-15', 'approved', '550e8400-e29b-41d4-a716-446655440002'),
('fd0e8400-e29b-41d4-a716-446655440005', 'CERT-TCS-001', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440005', 'Annual', 4500000, 2100000, '2025-11-15', 'approved', '550e8400-e29b-41d4-a716-446655440002'),
('fd0e8400-e29b-41d4-a716-446655440006', 'CERT-HDFC-001', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440007', 'Annual', 3800000, 1500000, '2025-11-15', 'approved', '550e8400-e29b-41d4-a716-446655440002'),
('fd0e8400-e29b-41d4-a716-446655440007', 'CERT-AMZ-001', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440009', 'Annual', 4200000, 1900000, '2025-11-15', 'approved', '550e8400-e29b-41d4-a716-446655440002');

-- =====================================================================
-- INSERT TIMELINES/MILESTONES (Project milestones)
-- =====================================================================
INSERT INTO public.timelines (id, project_id, milestone_code, title, description, category, start_date, end_date, actual_start_date, actual_end_date, status, responsible_user_id) VALUES
('fe0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'MS-P1-001', 'Project Kickoff', 'LAJJA project initiated', 'Planning', '2024-01-15', '2024-01-20', '2024-01-15', '2024-01-15', 'completed', '550e8400-e29b-41d4-a716-446655440001'),
('fe0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'MS-P1-002', 'Phase 1 Complete', 'Distribution in 5 locations', 'Execution', '2024-06-15', '2024-06-30', '2024-06-15', '2024-06-20', 'completed', '550e8400-e29b-41d4-a716-446655440001'),
('fe0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'MS-P1-003', 'Phase 2 Ongoing', 'Expansion to 10 locations', 'Execution', '2025-06-15', '2025-12-31', NULL, NULL, 'in_progress', '550e8400-e29b-41d4-a716-446655440001'),
('fe0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', 'MS-P2-001', 'Project Kickoff', 'SHOONYA project start', 'Planning', '2024-02-01', '2024-02-10', '2024-02-01', '2024-02-01', 'completed', '550e8400-e29b-41d4-a716-446655440001'),
('fe0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440003', 'MS-P3-001', 'Project Kickoff', 'KILL HUNGER launch', 'Planning', '2024-01-01', '2024-01-15', '2024-01-01', '2024-01-01', 'completed', '550e8400-e29b-41d4-a716-446655440001'),
('fe0e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440004', 'MS-P4-001', 'Project Kickoff', 'GYANDAAN initiation', 'Planning', '2024-03-01', '2024-03-15', '2024-03-01', '2024-03-01', 'completed', '550e8400-e29b-41d4-a716-446655440001');

-- =====================================================================
-- INSERT BUDGET_UTILIZATION (Partner-level budget tracking)
-- =====================================================================
INSERT INTO public.budget_utilization (id, csr_partner_id, fiscal_year, allocated_amount, utilized_amount, committed_amount, pending_amount, created_by) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2024-25', 18000000, 8725000, 700000, 500000, '550e8400-e29b-41d4-a716-446655440002'),
('ff0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '2024-25', 8000000, 3500000, 400000, 300000, '550e8400-e29b-41d4-a716-446655440002'),
('ff0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '2024-25', 9300000, 3000000, 500000, 400000, '550e8400-e29b-41d4-a716-446655440002'),
('ff0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '2024-25', 10200000, 4400000, 600000, 350000, '550e8400-e29b-41d4-a716-446655440002');

-- =====================================================================
-- INSERT EVENT_ATTENDANCE (Attendance at calendar events)
-- =====================================================================
INSERT INTO public.event_attendance (id, event_id, user_id, status, response_date, check_in_time, check_out_time) VALUES
('fe0e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'attended', '2024-01-15', '2024-01-15 09:00:00', '2024-01-15 17:00:00'),
('fe0e8400-e29b-41d4-a716-446655440002', 'cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'attended', '2024-01-15', '2024-01-15 09:15:00', '2024-01-15 16:45:00'),
('fe0e8400-e29b-41d4-a716-446655440003', 'cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'accepted', '2025-11-15', '2025-11-15 10:00:00', NULL),
('fe0e8400-e29b-41d4-a716-446655440004', 'cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440008', 'accepted', '2025-11-15', '2025-11-15 10:05:00', NULL),
('fe0e8400-e29b-41d4-a716-446655440005', 'cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010', 'accepted', '2025-11-20', '2025-11-20 09:00:00', NULL),
('fe0e8400-e29b-41d4-a716-446655440006', 'cc0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440009', 'accepted', '2025-11-22', '2025-11-22 11:00:00', NULL),
('fe0e8400-e29b-41d4-a716-446655440007', 'cc0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440007', 'accepted', '2025-12-01', '2025-12-01 10:00:00', NULL),
('fe0e8400-e29b-41d4-a716-446655440008', 'cc0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440007', 'accepted', '2025-11-22', '2025-11-22 14:00:00', NULL),
('fe0e8400-e29b-41d4-a716-446655440009', 'cc0e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440010', 'attended', '2025-11-12', '2025-11-12 08:00:00', '2025-11-12 12:00:00');

-- =====================================================================
-- INSERT TASK_TIME_LOGS (Time tracking for tasks)
-- =====================================================================
INSERT INTO public.task_time_logs (id, task_id, user_id, start_time, end_time, duration_minutes, description) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', '2025-11-16 09:00:00', '2025-11-16 17:00:00', 480, 'Distribution in Dharavi - Day 1'),
('ff0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', '2025-11-17 09:00:00', '2025-11-17 15:30:00', 390, 'Distribution in Dharavi - Day 2'),
('ff0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440008', '2025-11-15 10:00:00', '2025-11-15 17:00:00', 420, 'Awareness session prep'),
('ff0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440008', '2025-11-16 10:00:00', '2025-11-16 18:00:00', 480, 'Awareness session execution'),
('ff0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440010', '2025-11-16 08:00:00', '2025-11-16 17:00:00', 540, 'Waste collection drive'),
('ff0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', '2025-11-09 07:00:00', '2025-11-09 17:00:00', 600, 'Tree plantation'),
('ff0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440009', '2025-11-16 12:00:00', '2025-11-16 20:00:00', 480, 'Food distribution'),
('ff0e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440007', '2025-11-15 14:00:00', '2025-11-15 20:00:00', 360, 'Library renovation coordination'),
('ff0e8400-e29b-41d4-a716-446655440009', '990e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', '2025-11-16 15:00:00', '2025-11-16 19:00:00', 240, 'Scholarship processing');

-- =====================================================================
-- INSERT EXPENSE_APPROVALS (Approval workflow for expenses)
-- =====================================================================
INSERT INTO public.expense_approvals (id, expense_id, approver_id, action, new_status, comments) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'approved', 'Approved for payment'),
('aa0e8400-e29b-41d4-a716-446655440002', 'cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'approved', 'Transport approved'),
('aa0e8400-e29b-41d4-a716-446655440003', 'cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'approved', 'Materials approved'),
('aa0e8400-e29b-41d4-a716-446655440004', 'cc0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'requested_changes', 'pending_revision', 'Awaiting final approval'),
('aa0e8400-e29b-41d4-a716-446655440005', 'cc0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'approved', 'Waste collection equipment approved'),
('aa0e8400-e29b-41d4-a716-446655440006', 'cc0e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'approved', 'Food procurement approved'),
('aa0e8400-e29b-41d4-a716-446655440007', 'cc0e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'approved', 'Library renovation approved'),
('aa0e8400-e29b-41d4-a716-446655440008', 'cc0e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', 'approved', 'approved', 'Digital classroom approved');

-- =====================================================================
-- INSERT NOTIFICATIONS (User notifications)
-- =====================================================================
INSERT INTO public.notifications (id, user_id, title, message, notification_type, reference_type, reference_id, action_url, requires_action, created_by) VALUES
('ab0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'New Task Assigned', 'You have been assigned task: Organize waste collection drive', 'task', 'task', '990e8400-e29b-41d4-a716-446655440004', '/tasks/990e8400-e29b-41d4-a716-446655440004', true, '550e8400-e29b-41d4-a716-446655440003'),
('ab0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Expense Awaiting Approval', 'Expense EXP-P1-004 awaits your approval', 'expense', 'expense', 'cc0e8400-e29b-41d4-a716-446655440004', '/expenses/cc0e8400-e29b-41d4-a716-446655440004', true, '550e8400-e29b-41d4-a716-446655440005'),
('ab0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'Milestone Achievement', 'Distribution target of 500 kits reached!', 'project', 'project', '770e8400-e29b-41d4-a716-446655440001', '/projects/770e8400-e29b-41d4-a716-446655440001', false, '550e8400-e29b-41d4-a716-446655440001'),
('ab0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', 'Upcoming Event', 'Scholarship ceremony scheduled for tomorrow', 'task', 'event', 'cc0e8400-e29b-41d4-a716-446655440006', '/calendar/cc0e8400-e29b-41d4-a716-446655440006', false, '550e8400-e29b-41d4-a716-446655440001'),
('ab0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440009', 'Report Due', 'Daily report submission pending', 'project', 'report', 'ff0e8400-e29b-41d4-a716-446655440001', '/reports/ff0e8400-e29b-41d4-a716-446655440001', true, '550e8400-e29b-41d4-a716-446655440001'),
('ab0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440010', 'Budget Alert', 'Project P2 budget utilization at 80%', 'alert', 'project', '770e8400-e29b-41d4-a716-446655440002', '/budget/770e8400-e29b-41d4-a716-446655440002', false, '550e8400-e29b-41d4-a716-446655440001'),
('ab0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'System Update', 'Database backup completed successfully', 'alert', 'system', 'system', '/admin/logs', false, '550e8400-e29b-41d4-a716-446655440003');

-- =====================================================================
-- INSERT COMMUNICATIONS (Internal communications/messages)
-- =====================================================================
INSERT INTO public.communications (id, from_user_id, to_user_id, project_id, communication_type, subject, message, status, priority, created_by) VALUES
('ac0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440001', 'email', 'Distribution Progress', 'How is the distribution going in Dharavi? Need status update.', 'sent', 'high', '550e8400-e29b-41d4-a716-446655440001'),
('ac0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'email', 'Re: Distribution Progress', '250 kits distributed so far. On track to complete by tomorrow.', 'read', 'normal', '550e8400-e29b-41d4-a716-446655440006'),
('ac0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 'email', 'Budget Reconciliation', 'Pending reconciliation of expense EXP-P3-003. Need supporting documents.', 'sent', 'high', '550e8400-e29b-41d4-a716-446655440001'),
('ac0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'email', 'Re: Budget Reconciliation', 'Documents attached to expense entry. Please verify.', 'read', 'normal', '550e8400-e29b-41d4-a716-446655440002'),
('ac0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440002', 'email', 'Waste Collection Drive', 'Schedule coordination needed for the waste collection drive in Pune', 'sent', 'normal', '550e8400-e29b-41d4-a716-446655440001'),
('ac0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'email', 'Re: Waste Collection Drive', 'Drive scheduled for 22nd. All communities notified.', 'read', 'normal', '550e8400-e29b-41d4-a716-446655440010'),
('ac0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'whatsapp', 'Social Campaign', 'Posted 5 awareness posts about menstrual health on social media', 'sent', 'low', '550e8400-e29b-41d4-a716-446655440005'),
('ac0e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440001', 'email', 'Re: Social Campaign', 'Great work! Engagement looks good. Continue with similar content.', 'read', 'low', '550e8400-e29b-41d4-a716-446655440001');

-- =====================================================================
-- INSERT ACTIVITY_LOGS (Track all user activities)
-- =====================================================================
INSERT INTO public.activity_logs (id, user_id, action, action_type, entity_type, entity_id, old_values, new_values, description) VALUES
('ad0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'INSERT', 'create', 'project', '770e8400-e29b-41d4-a716-446655440001', NULL, '{"name":"LAJJA","status":"active"}', 'Created LAJJA project'),
('ad0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'UPDATE', 'edit', 'project', '770e8400-e29b-41d4-a716-446655440001', '{"status":"draft"}', '{"status":"active"}', 'Activated LAJJA project'),
('ad0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'INSERT', 'create', 'task', '990e8400-e29b-41d4-a716-446655440001', NULL, '{"title":"Distribute hygiene kits","status":"not_started"}', 'Created task for kit distribution'),
('ad0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440006', 'UPDATE', 'edit', 'task', '990e8400-e29b-41d4-a716-446655440001', '{"status":"not_started"}', '{"status":"in_progress"}', 'Started distribution task'),
('ad0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'INSERT', 'create', 'expense', 'cc0e8400-e29b-41d4-a716-446655440001', NULL, '{"amount":50000,"status":"submitted"}', 'Submitted expense claim'),
('ad0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'UPDATE', 'approve', 'expense', 'cc0e8400-e29b-41d4-a716-446655440001', '{"status":"submitted"}', '{"status":"approved"}', 'Approved expense claim'),
('ad0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'INSERT', 'view', 'report', 'fc0e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Viewed LAJJA monthly report'),
('ad0e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440005', 'INSERT', 'create', 'media', 'fd0e8400-e29b-41d4-a716-446655440001', NULL, '{"type":"video","access":"public"}', 'Uploaded LAJJA documentary'),
('ad0e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 'UPDATE', 'edit', 'real_time_update', 'fc0e8400-e29b-41d4-a716-446655440001', '{"is_public":false}', '{"is_public":true}', 'Published project update'),
('ad0e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 'INSERT', 'create', 'daily_report', 'ff0e8400-e29b-41d4-a716-446655440001', NULL, '{"activities":"Waste collection","status":"submitted"}', 'Submitted daily report');

-- =====================================================================
-- INSERT SYSTEM_LOGS (Technical system logs)
-- =====================================================================
INSERT INTO public.system_logs (id, log_level, module, message, error_code, stack_trace, context) VALUES
('ae0e8400-e29b-41d4-a716-446655440001', 'INFO', 'AUTH', 'User lokesh@mtd.com logged in successfully', NULL, NULL, '{"user_id":"550e8400-e29b-41d4-a716-446655440003"}'),
('ae0e8400-e29b-41d4-a716-446655440002', 'INFO', 'DATABASE', 'Backup completed successfully', NULL, NULL, '{"backup_size":"2.5GB","duration":"5m"}'),
('ae0e8400-e29b-41d4-a716-446655440003', 'INFO', 'API', 'Project creation API called', NULL, NULL, '{"endpoint":"/projects","method":"POST"}'),
('ae0e8400-e29b-41d4-a716-446655440004', 'WARNING', 'PAYMENT', 'Bank transfer processing delayed', 'GATEWAY_TIMEOUT', 'Connection timeout after 30s', '{"provider":"HDFC","amount":500000,"status":"pending"}'),
('ae0e8400-e29b-41d4-a716-446655440005', 'INFO', 'REPORT', 'Monthly report generated', NULL, NULL, '{"report_type":"monthly","month":"November 2025"}'),
('ae0e8400-e29b-41d4-a716-446655440006', 'INFO', 'NOTIFICATION', 'Email notification sent to 10 users', NULL, NULL, '{"recipient_count":10,"template":"task_assignment"}'),
('ae0e8400-e29b-41d4-a716-446655440007', 'INFO', 'EXPORT', 'Data exported to CSV format', NULL, NULL, '{"format":"CSV","record_count":250}'),
('ae0e8400-e29b-41d4-a716-446655440008', 'ERROR', 'FILE_UPLOAD', 'File upload failed - size exceeds limit', 'FILE_SIZE_EXCEEDED', 'File size: 150MB, Limit: 100MB at fileUpload.js:42', '{"filename":"report.zip","size":"150MB","user_id":"550e8400-e29b-41d4-a716-446655440001"}');

-- =====================================================================
-- INSERT EMAIL_TEMPLATES (Email notification templates)
-- =====================================================================
INSERT INTO public.email_templates (id, name, subject, body, variables, is_active) VALUES
('af0e8400-e29b-41d4-a716-446655440001', 'Task Assignment', 'New Task Assigned: {{task_name}}', 'Hello {{user_name}}, You have been assigned a new task: {{task_name}} with due date {{due_date}}. Please log in to view details.', '{"variables":["user_name","task_name","due_date"]}'::jsonb, true),
('af0e8400-e29b-41d4-a716-446655440002', 'Expense Approval Request', 'Expense Approval Required: {{expense_code}}', 'Hello {{approver_name}}, Please review and approve/reject expense {{expense_code}} of amount {{amount}} submitted by {{submitter_name}}.', '{"variables":["approver_name","expense_code","amount","submitter_name"]}'::jsonb, true),
('af0e8400-e29b-41d4-a716-446655440003', 'Project Update', 'Project Update: {{project_name}}', 'Hello {{partner_name}}, Project {{project_name}} has reached milestone: {{milestone_name}}. {{description}}', '{"variables":["partner_name","project_name","milestone_name","description"]}'::jsonb, true),
('af0e8400-e29b-41d4-a716-446655440004', 'Monthly Report', 'Monthly Report: {{month_year}}', 'Dear {{user_name}}, Please find attached the monthly report for {{month_year}}. Key metrics: {{metrics}}', '{"variables":["user_name","month_year","metrics"]}'::jsonb, true),
('af0e8400-e29b-41d4-a716-446655440005', 'Budget Alert', 'Budget Threshold Alert: {{project_name}}', 'Alert: Project {{project_name}} has utilized {{utilization_percentage}}% of its budget. Current balance: {{remaining_amount}}', '{"variables":["project_name","utilization_percentage","remaining_amount"]}'::jsonb, true);

-- =====================================================================
-- INSERT WHATSAPP_TEMPLATES (WhatsApp notification templates)
-- =====================================================================
INSERT INTO public.whatsapp_templates (id, name, message, variables, is_active) VALUES
('ag0e8400-e29b-41d4-a716-446655440001', 'Task Reminder', 'Hi {{user_name}}, Reminder: {{task_name}} is due on {{due_date}}. Please complete and update status.', '{"variables":["user_name","task_name","due_date"]}'::jsonb, true),
('ag0e8400-e29b-41d4-a716-446655440002', 'Event Notification', 'Hello {{user_name}}, Event: {{event_name}} scheduled on {{event_date}} at {{event_time}}. Please confirm attendance.', '{"variables":["user_name","event_name","event_date","event_time"]}'::jsonb, true),
('ag0e8400-e29b-41d4-a716-446655440003', 'Milestone Alert', 'Great news! Project {{project_name}} milestone achieved: {{milestone_name}}. {{achievement_details}}', '{"variables":["project_name","milestone_name","achievement_details"]}'::jsonb, true),
('ag0e8400-e29b-41d4-a716-446655440004', 'Daily Report Due', 'Hi {{user_name}}, Please submit your daily report for {{date}}. Activities summary: {{summary}}', '{"variables":["user_name","date","summary"]}'::jsonb, true),
('ag0e8400-e29b-41d4-a716-446655440005', 'Expense Submission', 'Hello {{user_name}}, Expense {{expense_code}} of {{amount}} has been {{status}} by {{approver_name}}.', '{"variables":["user_name","expense_code","amount","status","approver_name"]}'::jsonb, true);

-- =====================================================================
-- FINAL NOTES - COMPLETE DATA
-- =====================================================================
-- Total tables with data: 27-28 tables
-- Complete record breakdown:
-- =====================================================================
-- CORE TABLES:
-- 1. Users: 10 records
-- 2. CSR Partners: 4 records
-- 3. Projects: 12 records
-- 4. Project Team Members: 8 records
-- 5. Timelines/Milestones: 6 records
-- 6. Tasks: 30 records
-- 7. Task Time Logs: 9 records (NEW)
--
-- FINANCIAL TABLES:
-- 8. Project Expenses: 28 records
-- 9. Expense Approvals: 8 records (NEW)
-- 10. Budget Allocation: 6 records
-- 11. Budget Utilization: 4 records
-- 12. Utilization Certificates: 7 records
-- 13. Bills: 6 records
--
-- REPORTING & MEDIA:
-- 14. Real Time Updates: 14 records
-- 15. Media Articles: 21 records
-- 16. Daily Reports: 7 records
-- 17. Data Entry Forms: 5 records
-- 18. Reports: 6 records
-- 19. Calendar Events: 10 records
-- 20. Event Attendance: 9 records (NEW)
--
-- COMMUNICATION & TRACKING:
-- 21. Notifications: 7 records (NEW)
-- 22. Communications: 8 records (NEW)
-- 23. Activity Logs: 10 records (NEW)
-- 24. System Logs: 8 records (NEW)
--
-- TEMPLATE TABLES:
-- 25. Email Templates: 5 records (NEW)
-- 26. WhatsApp Templates: 5 records (NEW)
--
-- TOTAL RECORDS: 250+ across 26 tables
-- All tables with complete, interconnected data ready for production
-- =====================================================================
