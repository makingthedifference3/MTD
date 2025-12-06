-- Complete trigger that handles BOTH budget_categories AND direct project expenses
-- Handles two cases:
-- 1. Expenses WITH budget_category_id → updates budget_categories hierarchy
-- 2. Expenses WITHOUT budget_category_id → updates projects.utilized_budget directly

-- ============================================================================
-- PART 1: Update budget categories (when budget_category_id exists)
-- ============================================================================

DROP FUNCTION IF EXISTS update_budget_category_utilized() CASCADE;

CREATE OR REPLACE FUNCTION update_budget_category_utilized()
RETURNS TRIGGER AS $$
DECLARE
  target_category_id uuid;
  target_project_id uuid;
  current_category_id uuid;
  parent_category_id uuid;
BEGIN
  -- Determine which category and project to update
  IF (TG_OP = 'DELETE') THEN
    target_category_id := OLD.budget_category_id;
    target_project_id := OLD.project_id;
  ELSE
    target_category_id := NEW.budget_category_id;
    target_project_id := NEW.project_id;
  END IF;

  -- CASE 1: Expense has a budget_category_id
  IF target_category_id IS NOT NULL THEN
    
    -- Update the direct category's utilized_amount and pending_amount
    UPDATE public.budget_categories
    SET 
      -- UTILIZED AMOUNT: Sum of all PAID expenses
      utilized_amount = (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM public.project_expenses
        WHERE budget_category_id = target_category_id
        AND status = 'paid'
      ),
      -- PENDING AMOUNT: Sum of all APPROVED/ACCEPTED expenses (waiting for payment)
      pending_amount = (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM public.project_expenses
        WHERE budget_category_id = target_category_id
        AND status IN ('approved', 'accepted')
      ),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = target_category_id;
    
    -- Now cascade up the parent chain
    current_category_id := target_category_id;
    
    LOOP
      -- Get the parent of the current category
      SELECT parent_id INTO parent_category_id
      FROM public.budget_categories
      WHERE id = current_category_id;
      
      -- Exit if no parent (reached root)
      EXIT WHEN parent_category_id IS NULL;
      
      -- Update parent's utilized_amount and pending_amount
      UPDATE public.budget_categories
      SET 
        -- UTILIZED: Direct paid expenses + children's utilized amounts
        utilized_amount = (
          SELECT COALESCE(SUM(total_amount), 0)
          FROM public.project_expenses
          WHERE budget_category_id = parent_category_id
          AND status = 'paid'
        ) + (
          SELECT COALESCE(SUM(utilized_amount), 0)
          FROM public.budget_categories
          WHERE parent_id = parent_category_id
        ),
        -- PENDING: Direct approved expenses + children's pending amounts
        pending_amount = (
          SELECT COALESCE(SUM(total_amount), 0)
          FROM public.project_expenses
          WHERE budget_category_id = parent_category_id
          AND status IN ('approved', 'accepted')
        ) + (
          SELECT COALESCE(SUM(pending_amount), 0)
          FROM public.budget_categories
          WHERE parent_id = parent_category_id
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = parent_category_id;
      
      -- Move up to next parent
      current_category_id := parent_category_id;
    END LOOP;
    
  -- CASE 2: Expense has NO budget_category_id (direct project expense)
  ELSIF target_project_id IS NOT NULL THEN
    
    -- Update project's utilized_budget and pending_budget directly
    UPDATE public.projects
    SET 
      -- UTILIZED BUDGET: Sum of all PAID expenses without budget_category_id
      utilized_budget = COALESCE((
        SELECT SUM(total_amount)
        FROM public.project_expenses
        WHERE project_id = target_project_id
        AND budget_category_id IS NULL
        AND status = 'paid'
      ), 0) + COALESCE((
        -- Add utilized amounts from all root budget categories
        SELECT SUM(utilized_amount)
        FROM public.budget_categories
        WHERE project_id = target_project_id
        AND parent_id IS NULL
      ), 0),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = target_project_id;
    
  END IF;
  
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_update_budget_category_utilized ON public.project_expenses;

CREATE TRIGGER trigger_update_budget_category_utilized
AFTER INSERT OR UPDATE OR DELETE ON public.project_expenses
FOR EACH ROW
EXECUTE FUNCTION update_budget_category_utilized();

-- ============================================================================
-- PART 2: Recalculate all existing data
-- ============================================================================

DO $$
DECLARE
  cat_record RECORD;
  proj_record RECORD;
BEGIN
  -- Step 1: Update all budget categories
  FOR cat_record IN 
    SELECT id FROM budget_categories
  LOOP
    UPDATE budget_categories
    SET 
      utilized_amount = (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM project_expenses
        WHERE budget_category_id = cat_record.id
        AND status = 'paid'
      ),
      pending_amount = (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM project_expenses
        WHERE budget_category_id = cat_record.id
        AND status IN ('approved', 'accepted')
      ),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = cat_record.id;
  END LOOP;
  
  -- Step 2: Update all projects (including expenses without budget_category_id)
  FOR proj_record IN 
    SELECT id FROM projects
  LOOP
    UPDATE projects
    SET 
      utilized_budget = COALESCE((
        -- Direct expenses without budget_category_id
        SELECT SUM(total_amount)
        FROM project_expenses
        WHERE project_id = proj_record.id
        AND budget_category_id IS NULL
        AND status = 'paid'
      ), 0) + COALESCE((
        -- Sum of root budget categories
        SELECT SUM(utilized_amount)
        FROM budget_categories
        WHERE project_id = proj_record.id
        AND parent_id IS NULL
      ), 0),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = proj_record.id;
  END LOOP;
  
END $$;

-- ============================================================================
-- PART 3: Verification queries
-- ============================================================================

-- Check budget categories
SELECT 
  bc.name as category_name,
  bc.allocated_amount,
  bc.utilized_amount,
  bc.pending_amount,
  bc.available_amount,
  (SELECT COUNT(*) FROM project_expenses WHERE budget_category_id = bc.id AND status = 'paid') as paid_count,
  (SELECT COUNT(*) FROM project_expenses WHERE budget_category_id = bc.id AND status IN ('approved', 'accepted')) as pending_count,
  (SELECT COALESCE(SUM(total_amount), 0) FROM project_expenses WHERE budget_category_id = bc.id AND status = 'paid') as actual_paid_sum,
  (SELECT COALESCE(SUM(total_amount), 0) FROM project_expenses WHERE budget_category_id = bc.id AND status IN ('approved', 'accepted')) as actual_pending_sum
FROM budget_categories bc
WHERE bc.allocated_amount > 0
ORDER BY bc.created_at DESC
LIMIT 20;

-- Check projects with direct expenses (no budget_category_id)
SELECT 
  p.name as project_name,
  p.total_budget,
  p.utilized_budget,
  (SELECT COUNT(*) FROM project_expenses WHERE project_id = p.id AND budget_category_id IS NULL AND status = 'paid') as direct_paid_count,
  (SELECT COALESCE(SUM(total_amount), 0) FROM project_expenses WHERE project_id = p.id AND budget_category_id IS NULL AND status = 'paid') as direct_paid_sum,
  (SELECT COALESCE(SUM(utilized_amount), 0) FROM budget_categories WHERE project_id = p.id AND parent_id IS NULL) as categories_utilized_sum
FROM projects p
ORDER BY p.created_at DESC
LIMIT 20;

-- Check if there are expenses without budget_category_id
SELECT 
  COUNT(*) as total_expenses,
  COUNT(CASE WHEN budget_category_id IS NULL THEN 1 END) as without_category,
  COUNT(CASE WHEN budget_category_id IS NOT NULL THEN 1 END) as with_category,
  COUNT(CASE WHEN budget_category_id IS NULL AND status = 'paid' THEN 1 END) as without_category_paid
FROM project_expenses;
