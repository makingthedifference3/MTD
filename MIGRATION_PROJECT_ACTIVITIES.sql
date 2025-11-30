-- =====================================================
-- PROJECT ACTIVITIES TABLE FOR PROJECT TIMELINE
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing table if exists (for fresh start)
DROP TABLE IF EXISTS project_activity_items CASCADE;
DROP TABLE IF EXISTS project_activities CASCADE;

-- =====================================================
-- MAIN ACTIVITIES TABLE
-- =====================================================
CREATE TABLE project_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_code VARCHAR(50) UNIQUE,
  
  -- Relationships
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  csr_partner_id UUID NOT NULL REFERENCES csr_partners(id) ON DELETE CASCADE,
  toll_id UUID REFERENCES csr_partner_tolls(id) ON DELETE SET NULL,
  
  -- Activity Info
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Section/Category
  section VARCHAR(255) DEFAULT 'General',
  section_order INT DEFAULT 1,
  activity_order INT DEFAULT 1,
  
  -- Dates
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Assignment
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  responsible_person VARCHAR(255),
  
  -- Priority
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Additional Info
  remarks TEXT,
  blockers TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- ACTIVITY ITEMS (Description Points with Tick)
-- =====================================================
CREATE TABLE project_activity_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES project_activities(id) ON DELETE CASCADE,
  
  -- Item Info
  item_text TEXT NOT NULL,
  item_order INT DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_project_activities_project ON project_activities(project_id);
CREATE INDEX idx_project_activities_partner ON project_activities(csr_partner_id);
CREATE INDEX idx_project_activities_toll ON project_activities(toll_id);
CREATE INDEX idx_project_activities_status ON project_activities(status);
CREATE INDEX idx_project_activities_section ON project_activities(section);
CREATE INDEX idx_project_activity_items_activity ON project_activity_items(activity_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-generate activity code
CREATE OR REPLACE FUNCTION generate_activity_code()
RETURNS TRIGGER AS $$
DECLARE
  partner_code VARCHAR(10);
  project_code VARCHAR(10);
  seq_num INT;
BEGIN
  -- Get partner code (first 3 chars)
  SELECT UPPER(SUBSTRING(name, 1, 3)) INTO partner_code
  FROM csr_partners WHERE id = NEW.csr_partner_id;
  
  -- Get project code (first 3 chars)
  SELECT UPPER(SUBSTRING(name, 1, 3)) INTO project_code
  FROM projects WHERE id = NEW.project_id;
  
  -- Get sequence number
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(activity_code FROM '[0-9]+$') AS INT)
  ), 0) + 1 INTO seq_num
  FROM project_activities
  WHERE project_id = NEW.project_id;
  
  NEW.activity_code := CONCAT('ACT-', COALESCE(partner_code, 'XXX'), '-', COALESCE(project_code, 'XXX'), '-', LPAD(seq_num::TEXT, 4, '0'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_activity_code
BEFORE INSERT ON project_activities
FOR EACH ROW
WHEN (NEW.activity_code IS NULL)
EXECUTE FUNCTION generate_activity_code();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_activity_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_activity_timestamp
BEFORE UPDATE ON project_activities
FOR EACH ROW
EXECUTE FUNCTION update_activity_timestamp();

CREATE TRIGGER trg_update_activity_item_timestamp
BEFORE UPDATE ON project_activity_items
FOR EACH ROW
EXECUTE FUNCTION update_activity_timestamp();

-- Auto-update activity completion % based on items
CREATE OR REPLACE FUNCTION update_activity_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_items INT;
  completed_items INT;
  new_percentage INT;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed = true)
  INTO total_items, completed_items
  FROM project_activity_items
  WHERE activity_id = COALESCE(NEW.activity_id, OLD.activity_id);
  
  IF total_items > 0 THEN
    new_percentage := ROUND((completed_items::DECIMAL / total_items) * 100);
  ELSE
    new_percentage := 0;
  END IF;
  
  UPDATE project_activities
  SET completion_percentage = new_percentage,
      status = CASE
        WHEN new_percentage = 100 THEN 'completed'
        WHEN new_percentage > 0 THEN 'in_progress'
        ELSE status
      END
  WHERE id = COALESCE(NEW.activity_id, OLD.activity_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_activity_completion
AFTER INSERT OR UPDATE OR DELETE ON project_activity_items
FOR EACH ROW
EXECUTE FUNCTION update_activity_completion();

-- Update project completion based on activities
CREATE OR REPLACE FUNCTION update_project_completion_from_activities()
RETURNS TRIGGER AS $$
DECLARE
  avg_completion DECIMAL;
BEGIN
  SELECT COALESCE(AVG(completion_percentage), 0)
  INTO avg_completion
  FROM project_activities
  WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    AND is_active = true;
  
  UPDATE projects
  SET completion_percentage = ROUND(avg_completion)
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_project_completion
AFTER INSERT OR UPDATE OR DELETE ON project_activities
FOR EACH ROW
EXECUTE FUNCTION update_project_completion_from_activities();

-- =====================================================
-- ROW LEVEL SECURITY (DISABLED)
-- =====================================================
ALTER TABLE project_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity_items DISABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (cleanup)
DROP POLICY IF EXISTS "Enable read access for all users" ON project_activities;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON project_activities;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON project_activities;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON project_activities;

DROP POLICY IF EXISTS "Enable read access for all users" ON project_activity_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON project_activity_items;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON project_activity_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON project_activity_items;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'project_activit%';
