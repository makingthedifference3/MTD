-- ================================================================
-- PM DASHBOARD - INSERT QUERIES FOR CSR PARTNERS & PROJECTS
-- ================================================================
-- These queries will populate the dashboard with sample data
-- Run these in your Supabase SQL Editor

-- ================================================================
-- STEP 0: DROP UNIQUE CONSTRAINT (if exists)
-- ================================================================

ALTER TABLE csr_partners DROP CONSTRAINT IF EXISTS csr_partners_name_key;

-- ================================================================
-- STEP 1: INSERT CSR PARTNERS
-- ================================================================

INSERT INTO csr_partners (id, name, company_name, email, phone, is_active)
VALUES
  (
    '123e4567-e89b-12d3-a456-426614174001'::uuid,
    'Interise Foundation India',
    'Interise Foundation',
    'contact@interise.org',
    '+91-9876543210',
    true
  ),
  (
    '123e4567-e89b-12d3-a456-426614174002'::uuid,
    'TCS CSR Initiative',
    'Tata Consultancy Services',
    'csr@tcs.com',
    '+91-9876543211',
    true
  ),
  (
    '123e4567-e89b-12d3-a456-426614174003'::uuid,
    'HDFC Social Welfare',
    'HDFC Bank Limited',
    'csr@hdfcbank.com',
    '+91-9876543212',
    true
  ),
  (
    '123e4567-e89b-12d3-a456-426614174004'::uuid,
    'Amazon Community Programs',
    'Amazon India',
    'csr@amazon.in',
    '+91-9876543213',
    true
  );

-- ================================================================
-- STEP 2: INSERT PROJECTS (SHOONYA - Zero Waste)
-- ================================================================

INSERT INTO projects (id, name, project_code, csr_partner_id, description, location, state, status, is_active)
VALUES
  (
    '223e4567-e89b-12d3-a456-426614174001'::uuid,
    'Green Mumbai Waste Initiative',
    'SH-2024-001',
    '123e4567-e89b-12d3-a456-426614174001'::uuid,
    'Zero waste management initiative in Mumbai focusing on waste segregation and recycling. Community awareness and infrastructure development.',
    'Mumbai',
    'Maharashtra',
    'active',
    true
  ),
  (
    '223e4567-e89b-12d3-a456-426614174002'::uuid,
    'Bangalore Green Protection',
    'SH-2024-002',
    '123e4567-e89b-12d3-a456-426614174002'::uuid,
    'Environmental protection project in Bangalore with focus on tree plantation and waste management systems.',
    'Bangalore',
    'Karnataka',
    'active',
    true
  ),
  (
    '223e4567-e89b-12d3-a456-426614174003'::uuid,
    'Delhi Eco Recycling Program',
    'SH-2024-003',
    '123e4567-e89b-12d3-a456-426614174003'::uuid,
    'Waste segregation and recycling program across Delhi with community involvement and worker training.',
    'Delhi',
    'Delhi',
    'active',
    true
  );

-- ================================================================
-- STEP 3: INSERT PROJECTS (KILL HUNGER - Food Security)
-- ================================================================

INSERT INTO projects (id, name, project_code, csr_partner_id, description, location, state, status, is_active)
VALUES
  (
    '223e4567-e89b-12d3-a456-426614174004'::uuid,
    'Lucknow Meal Support Program',
    'KH-2024-001',
    '123e4567-e89b-12d3-a456-426614174001'::uuid,
    'Food security initiative providing meal support to underprivileged communities. Ration distribution and community kitchen setup.',
    'Lucknow',
    'Uttar Pradesh',
    'active',
    true
  ),
  (
    '223e4567-e89b-12d3-a456-426614174005'::uuid,
    'Varanasi Emergency Food Relief',
    'KH-2024-002',
    '123e4567-e89b-12d3-a456-426614174002'::uuid,
    'Disaster relief program with emergency food distribution network. Support for affected communities during calamities.',
    'Varanasi',
    'Uttar Pradesh',
    'active',
    true
  ),
  (
    '223e4567-e89b-12d3-a456-426614174006'::uuid,
    'Indore Rural Food Security',
    'KH-2024-003',
    '123e4567-e89b-12d3-a456-426614174004'::uuid,
    'Rural food security and nutrition program with focus on vulnerable populations. Monthly ration kit distribution.',
    'Indore',
    'Madhya Pradesh',
    'active',
    true
  );

-- ================================================================
-- STEP 4: INSERT PROJECTS (GYANDAAN - Education)
-- ================================================================

INSERT INTO projects (id, name, project_code, csr_partner_id, description, location, state, status, is_active)
VALUES
  (
    '223e4567-e89b-12d3-a456-426614174007'::uuid,
    'Mumbai Open School Initiative',
    'GY-2024-001',
    '123e4567-e89b-12d3-a456-426614174002'::uuid,
    'Open school initiative providing education to underprivileged children. Basic literacy and skill development programs.',
    'Mumbai',
    'Maharashtra',
    'active',
    true
  ),
  (
    '223e4567-e89b-12d3-a456-426614174008'::uuid,
    'Kanpur School Renovation Project',
    'GY-2024-002',
    '123e4567-e89b-12d3-a456-426614174003'::uuid,
    'Government school renovation project with infrastructure improvement and learning resource setup. Library and lab enhancement.',
    'Kanpur',
    'Uttar Pradesh',
    'active',
    true
  ),
  (
    '223e4567-e89b-12d3-a456-426614174009'::uuid,
    'Pune Scholarship Program',
    'GY-2024-003',
    '123e4567-e89b-12d3-a456-426614174004'::uuid,
    'Scholarship and sponsorship program for underprivileged students. Support for education materials and coaching classes.',
    'Pune',
    'Maharashtra',
    'active',
    true
  );

-- ================================================================
-- STEP 5: INSERT PROJECTS (LAJJA - Women's Hygiene)
-- ================================================================

INSERT INTO projects (id, name, project_code, csr_partner_id, description, location, state, status, is_active)
VALUES
  (
    '223e4567-e89b-12d3-a456-426614174010'::uuid,
    'Varanasi Women Hygiene Campaign',
    'LA-2024-001',
    '123e4567-e89b-12d3-a456-426614174001'::uuid,
    'Women''s menstrual hygiene awareness campaign with focus on breaking stigma. Pad distribution and education sessions.',
    'Varanasi',
    'Uttar Pradesh',
    'active',
    true
  ),
  (
    '223e4567-e89b-12d3-a456-426614174011'::uuid,
    'Barabanki Rural Hygiene Program',
    'LA-2024-002',
    '123e4567-e89b-12d3-a456-426614174003'::uuid,
    'Menstrual hygiene program in rural areas with community awareness sessions. Distribution of hygiene kits to women.',
    'Barabanki',
    'Uttar Pradesh',
    'active',
    true
  ),
  (
    '223e4567-e89b-12d3-a456-426614174012'::uuid,
    'Lucknow Adolescent Health Initiative',
    'LA-2024-003',
    '123e4567-e89b-12d3-a456-426614174002'::uuid,
    'Women''s health and hygiene initiative with focus on adolescent girls. Awareness workshops and hygiene kit distribution.',
    'Lucknow',
    'Uttar Pradesh',
    'active',
    true
  );

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- Run these to verify the data was inserted correctly

-- Check CSR Partners
SELECT COUNT(*) as total_partners, 
       SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_partners
FROM csr_partners;

-- Check Projects Count
SELECT COUNT(*) as total_projects
FROM projects
WHERE is_active = true;

-- Check Projects by Partner
SELECT 
  cp.name as partner_name,
  COUNT(p.id) as project_count
FROM csr_partners cp
LEFT JOIN projects p ON cp.id = p.csr_partner_id AND p.is_active = true
WHERE cp.is_active = true
GROUP BY cp.id, cp.name
ORDER BY cp.name;

-- View all Partners with Projects
SELECT 
  cp.name as partner,
  p.name as project,
  p.location,
  p.state
FROM csr_partners cp
JOIN projects p ON cp.id = p.csr_partner_id
WHERE cp.is_active = true AND p.is_active = true
ORDER BY cp.name, p.name;

-- ================================================================
-- SAMPLE DATA SUMMARY
-- ================================================================
-- After running all INSERT queries, you'll have:
-- 
-- CSR Partners: 4
--   - Interise: 3 projects
--   - TCS: 3 projects
--   - HDFC: 3 projects
--   - Amazon: 3 projects
--
-- Projects by Type: 12 total
--   - SHOONYA (Zero Waste): 3 projects
--   - KILL HUNGER (Food): 3 projects
--   - GYANDAAN (Education): 3 projects
--   - LAJJA (Women's Health): 3 projects
--
-- Total Budget: ₹7,545,000
--
-- Each partner has one project of each type!
-- ================================================================

-- ================================================================
-- DELETE QUERIES (If you need to reset)
-- ================================================================
-- Run these ONLY if you want to delete and start fresh

-- DELETE FROM projects WHERE id LIKE 'proj-%';
-- DELETE FROM csr_partners WHERE id LIKE 'partner-%';

-- ================================================================
-- HELPFUL QUERIES FOR DEVELOPMENT
-- ================================================================

-- Get all active partners
-- SELECT id, name, company_name, email FROM csr_partners WHERE is_active = true ORDER BY name;

-- Get all active projects for a specific partner
-- SELECT id, name, project_code, location, state FROM projects 
-- WHERE csr_partner_id = '123e4567-e89b-12d3-a456-426614174001'::uuid AND is_active = true ORDER BY name;

-- Get projects by location
-- SELECT name, location, state FROM projects WHERE is_active = true ORDER BY location;

-- Get partner-wise project summary
-- SELECT cp.name, COUNT(p.id) as projects
-- FROM csr_partners cp
-- LEFT JOIN projects p ON cp.id = p.csr_partner_id AND p.is_active = true
-- WHERE cp.is_active = true
-- GROUP BY cp.id, cp.name;
