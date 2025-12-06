-- First, let's check if the trigger function is correct
-- Drop and recreate the trigger function to ensure it ONLY updates on 'paid' status

DROP FUNCTION IF EXISTS update_budget_category_utilized() CASCADE;

CREATE OR REPLACE FUNCTION update_budget_category_utilized()
RETURNS TRIGGER AS $$
DECLARE
  target_category_id uuid;
  current_category_id uuid;
  parent_category_id uuid;
BEGIN
  -- Determine which category to update
  IF (TG_OP = 'DELETE') THEN
    target_category_id := OLD.budget_category_id;
  ELSE
    target_category_id := NEW.budget_category_id;
  END IF;

  -- Only proceed if there's a budget category linked
  IF target_category_id IS NOT NULL THEN
    -- CRITICAL: Check if the status is ONLY 'paid'
    -- This should NOT trigger on 'approved', 'accepted', 'pending', etc.
    IF (TG_OP = 'DELETE' AND OLD.status = 'paid') OR
       (TG_OP IN ('INSERT', 'UPDATE') AND NEW.status = 'paid') THEN
      
      -- Update the direct category's utilized amount
      UPDATE public.budget_categories
      SET utilized_amount = (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM public.project_expenses
        WHERE budget_category_id = target_category_id
        AND status = 'paid'  -- ONLY paid expenses
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
        
        -- Update parent's utilized amount = sum of all its children's utilized amounts + direct expenses
        UPDATE public.budget_categories
        SET utilized_amount = (
          -- Sum of direct expenses to this parent (ONLY paid)
          SELECT COALESCE(SUM(total_amount), 0)
          FROM public.project_expenses
          WHERE budget_category_id = parent_category_id
          AND status = 'paid'  -- ONLY paid expenses
        ) + (
          -- Sum of all child categories' utilized amounts
          SELECT COALESCE(SUM(utilized_amount), 0)
          FROM public.budget_categories
          WHERE parent_id = parent_category_id
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = parent_category_id;
        
        -- Move up to next parent
        current_category_id := parent_category_id;
      END LOOP;
      
    END IF;
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

-- Now reset all budget categories to recalculate from scratch (ONLY paid expenses)
-- This will fix any incorrect calculations
DO $$
DECLARE
  cat_record RECORD;
BEGIN
  -- Update all budget categories to recalculate utilized_amount based ONLY on paid expenses
  FOR cat_record IN 
    SELECT id FROM budget_categories
  LOOP
    UPDATE budget_categories
    SET utilized_amount = (
      SELECT COALESCE(SUM(total_amount), 0)
      FROM project_expenses
      WHERE budget_category_id = cat_record.id
      AND status = 'paid'  -- ONLY paid expenses
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = cat_record.id;
  END LOOP;
  
  -- Now recalculate all project budgets
  PERFORM recalculate_all_project_budgets();
END $$;

-- Verification query: Check if any non-paid expenses are being counted
SELECT 
  pe.expense_code,
  pe.status,
  pe.total_amount,
  bc.name as budget_category,
  bc.utilized_amount
FROM project_expenses pe
JOIN budget_categories bc ON pe.budget_category_id = bc.id
WHERE pe.status != 'paid'
ORDER BY pe.created_at DESC
LIMIT 20;
