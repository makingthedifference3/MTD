-- Trigger to automatically update project's utilized_budget when budget_categories change

-- Function to update project utilized budget
CREATE OR REPLACE FUNCTION update_project_utilized_budget()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the project's utilized_budget by summing all root category utilized amounts
  UPDATE projects
  SET 
    utilized_budget = (
      SELECT COALESCE(SUM(utilized_amount), 0)
      FROM budget_categories
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
        AND parent_id IS NULL  -- Only sum root categories
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_project_budget ON budget_categories;

-- Create trigger that fires after INSERT, UPDATE, or DELETE on budget_categories
CREATE TRIGGER trigger_update_project_budget
AFTER INSERT OR UPDATE OR DELETE ON budget_categories
FOR EACH ROW
EXECUTE FUNCTION update_project_utilized_budget();

-- Also create a function to recalculate all projects (run this once to fix existing data)
CREATE OR REPLACE FUNCTION recalculate_all_project_budgets()
RETURNS void AS $$
BEGIN
  UPDATE projects p
  SET 
    utilized_budget = (
      SELECT COALESCE(SUM(bc.utilized_amount), 0)
      FROM budget_categories bc
      WHERE bc.project_id = p.id
        AND bc.parent_id IS NULL  -- Only sum root categories
    ),
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Execute the recalculation to fix existing data
SELECT recalculate_all_project_budgets();

-- Verify the trigger works
-- You can test with: SELECT * FROM projects WHERE id = 'your-project-id';
