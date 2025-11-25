-- =====================================================================
-- ALTER PROJECTS TABLE TO ADD MISSING STATS COLUMNS
-- =====================================================================

-- Add new columns for project impact metrics
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS meals_served INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS pads_distributed INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS students_enrolled INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS trees_planted INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS schools_renovated INT DEFAULT 0;

-- Add color and icon for UI display
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS display_color VARCHAR(50) DEFAULT 'emerald',
ADD COLUMN IF NOT EXISTS display_icon VARCHAR(50) DEFAULT 'FolderKanban';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_display_color ON public.projects(display_color);

-- Update trigger to handle updated_at
CREATE OR REPLACE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================================
-- SAMPLE DATA UPDATE (for existing projects)
-- Update the new columns based on project codes
-- =====================================================================

-- SHOONYA projects (Environment)
UPDATE public.projects
SET 
  display_color = 'emerald',
  display_icon = 'Leaf',
  trees_planted = CASE 
    WHEN project_code LIKE 'SH-%' THEN 50000
    ELSE trees_planted
  END,
  total_beneficiaries = CASE 
    WHEN project_code LIKE 'SH-%' AND total_beneficiaries = 0 THEN 12000
    ELSE total_beneficiaries
  END
WHERE project_code LIKE 'SH-%';

-- KILL HUNGER projects (Health & Hunger)
UPDATE public.projects
SET 
  display_color = 'red',
  display_icon = 'Heart',
  meals_served = CASE 
    WHEN project_code LIKE 'KH-%' THEN 100000
    ELSE meals_served
  END,
  total_beneficiaries = CASE 
    WHEN project_code LIKE 'KH-%' AND total_beneficiaries = 0 THEN 25000
    ELSE total_beneficiaries
  END
WHERE project_code LIKE 'KH-%';

-- GYANDAAN projects (Education)
UPDATE public.projects
SET 
  display_color = 'blue',
  display_icon = 'GraduationCap',
  students_enrolled = CASE 
    WHEN project_code LIKE 'GY-%' THEN 5000
    ELSE students_enrolled
  END,
  schools_renovated = CASE 
    WHEN project_code LIKE 'GY-%' THEN 15
    ELSE schools_renovated
  END,
  total_beneficiaries = CASE 
    WHEN project_code LIKE 'GY-%' AND total_beneficiaries = 0 THEN 8000
    ELSE total_beneficiaries
  END
WHERE project_code LIKE 'GY-%';

-- LAJJA projects (Women Hygiene)
UPDATE public.projects
SET 
  display_color = 'pink',
  display_icon = 'Droplet',
  pads_distributed = CASE 
    WHEN project_code LIKE 'LA-%' THEN 11000
    ELSE pads_distributed
  END,
  total_beneficiaries = CASE 
    WHEN project_code LIKE 'LA-%' AND total_beneficiaries = 0 THEN 12000
    ELSE total_beneficiaries
  END
WHERE project_code LIKE 'LA-%';
