-- =====================================================================
-- ADD PROJECT_METRICS TABLE TO SUPPORT DASHBOARD CARDS
-- This table stores KPIs and metrics for each project
-- =====================================================================

CREATE TABLE public.project_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  current BIGINT DEFAULT 0,
  target BIGINT DEFAULT 0,
  
  type VARCHAR(50) NOT NULL CHECK (type IN ('beneficiaries', 'events', 'donations', 'volunteers', 'schools', 'reach')),
  
  -- Detailed breakdown (stored as JSONB for flexibility)
  details JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_project_metrics_project_id ON public.project_metrics(project_id);
CREATE INDEX idx_project_metrics_type ON public.project_metrics(type);
CREATE INDEX idx_project_metrics_is_active ON public.project_metrics(is_active);

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_project_metrics_updated_at
BEFORE UPDATE ON public.project_metrics
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- SEED DATA - Convert mockData dashboardCards to database
-- =====================================================================

-- Insert project_metrics data (example for existing projects)
-- Note: This assumes projects p1, p3, p4 exist in the projects table

-- For project p1 (LAJJA - Interise)
INSERT INTO public.project_metrics (project_id, title, current, target, type, details) VALUES
(
  (SELECT id FROM projects WHERE project_code = 'PROJ-001' LIMIT 1),
  'No. of Beneficiaries',
  500,
  1000,
  'beneficiaries',
  '{"male": 200, "female": 250, "children": 50, "locations": [{"name": "Mumbai", "count": 300}, {"name": "Pune", "count": 150}, {"name": "Nagpur", "count": 50}]}'::jsonb
);

INSERT INTO public.project_metrics (project_id, title, current, target, type, details) VALUES
(
  (SELECT id FROM projects WHERE project_code = 'PROJ-001' LIMIT 1),
  'Events Conducted',
  15,
  30,
  'events',
  '{}'::jsonb
);

INSERT INTO public.project_metrics (project_id, title, current, target, type, details) VALUES
(
  (SELECT id FROM projects WHERE project_code = 'PROJ-001' LIMIT 1),
  'Donations Received',
  750000,
  1500000,
  'donations',
  '{}'::jsonb
);

INSERT INTO public.project_metrics (project_id, title, current, target, type, details) VALUES
(
  (SELECT id FROM projects WHERE project_code = 'PROJ-001' LIMIT 1),
  'Volunteers Engaged',
  45,
  100,
  'volunteers',
  '{}'::jsonb
);

INSERT INTO public.project_metrics (project_id, title, current, target, type, details) VALUES
(
  (SELECT id FROM projects WHERE project_code = 'PROJ-001' LIMIT 1),
  'Schools Covered',
  12,
  25,
  'schools',
  '{}'::jsonb
);

INSERT INTO public.project_metrics (project_id, title, current, target, type, details) VALUES
(
  (SELECT id FROM projects WHERE project_code = 'PROJ-001' LIMIT 1),
  'Social Media Reach',
  25000,
  50000,
  'reach',
  '{}'::jsonb
);

-- =====================================================================
-- HELPER VIEW FOR DASHBOARD METRICS
-- =====================================================================

CREATE OR REPLACE VIEW dashboard_metrics_aggregated AS
SELECT
  p.id AS project_id,
  p.name AS project_name,
  p.csr_partner_id,
  cp.name AS partner_name,
  pm.type,
  SUM(pm.current) AS total_current,
  SUM(pm.target) AS total_target,
  COUNT(*) AS metric_count,
  ROUND((SUM(pm.current)::FLOAT / NULLIF(SUM(pm.target), 0)) * 100, 2) AS completion_percentage
FROM project_metrics pm
JOIN projects p ON pm.project_id = p.id
JOIN csr_partners cp ON p.csr_partner_id = cp.id
WHERE pm.is_active = true
GROUP BY p.id, p.name, p.csr_partner_id, cp.name, pm.type;
