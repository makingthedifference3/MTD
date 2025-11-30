-- Migration: Add budget_categories table for hierarchical project budget management
-- Created: December 1, 2025

-- Create budget_categories table
CREATE TABLE public.budget_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  parent_id uuid, -- NULL = top-level category
  name character varying NOT NULL,
  
  -- Budget tracking
  allocated_amount numeric(15,2) DEFAULT 0 CHECK (allocated_amount >= 0),
  utilized_amount numeric(15,2) DEFAULT 0 CHECK (utilized_amount >= 0),
  pending_amount numeric(15,2) DEFAULT 0 CHECK (pending_amount >= 0),
  available_amount numeric(15,2) GENERATED ALWAYS AS (allocated_amount - utilized_amount - pending_amount) STORED,
    
  -- Audit fields
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  created_by uuid,
  updated_by uuid,
  
  CONSTRAINT budget_categories_pkey PRIMARY KEY (id),
  CONSTRAINT budget_categories_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT budget_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.budget_categories(id) ON DELETE CASCADE,
  CONSTRAINT budget_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT budget_categories_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id),
  
  -- Ensure utilized doesn't exceed allocated
  CONSTRAINT check_utilized_not_exceed_allocated CHECK (utilized_amount <= allocated_amount + pending_amount)
);

-- Indexes for performance
CREATE INDEX idx_budget_categories_project_id ON public.budget_categories(project_id);
CREATE INDEX idx_budget_categories_parent_id ON public.budget_categories(parent_id);
CREATE INDEX idx_budget_categories_project_parent ON public.budget_categories(project_id, parent_id);

-- Add budget_category_id to project_expenses table
ALTER TABLE public.project_expenses 
ADD COLUMN budget_category_id uuid REFERENCES public.budget_categories(id);

CREATE INDEX idx_project_expenses_budget_category ON public.project_expenses(budget_category_id);

-- Optional: Add trigger to update utilized_amount when expenses are added/modified
-- This also cascades updates to parent categories
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
    -- Check if the status is one that affects utilization
    IF (TG_OP = 'DELETE' AND OLD.status IN ('approved', 'paid', 'reimbursed')) OR
       (TG_OP IN ('INSERT', 'UPDATE') AND NEW.status IN ('approved', 'paid', 'reimbursed')) THEN
      
      -- Update the direct category's utilized amount
      UPDATE public.budget_categories
      SET utilized_amount = (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM public.project_expenses
        WHERE budget_category_id = target_category_id
        AND status IN ('approved', 'paid', 'reimbursed')
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
          -- Sum of direct expenses to this parent
          SELECT COALESCE(SUM(total_amount), 0)
          FROM public.project_expenses
          WHERE budget_category_id = parent_category_id
          AND status IN ('approved', 'paid', 'reimbursed')
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

CREATE TRIGGER trigger_update_budget_category_utilized
AFTER INSERT OR UPDATE OR DELETE ON public.project_expenses
FOR EACH ROW
EXECUTE FUNCTION update_budget_category_utilized();

-- Optional: Function to get budget category tree with aggregated amounts
CREATE OR REPLACE FUNCTION get_budget_category_tree(p_project_id uuid)
RETURNS TABLE (
  id uuid,
  project_id uuid,
  parent_id uuid,
  name varchar,
  allocated_amount numeric,
  utilized_amount numeric,
  pending_amount numeric,
  available_amount numeric,
  level int
) AS $$
WITH RECURSIVE category_tree AS (
  -- Base case: root categories
  SELECT 
    bc.id,
    bc.project_id,
    bc.parent_id,
    bc.name,
    bc.allocated_amount,
    bc.utilized_amount,
    bc.pending_amount,
    bc.available_amount,
    0 as level
  FROM public.budget_categories bc
  WHERE bc.project_id = p_project_id
  AND bc.parent_id IS NULL
  
  UNION ALL
  
  -- Recursive case: child categories
  SELECT 
    bc.id,
    bc.project_id,
    bc.parent_id,
    bc.name,
    bc.allocated_amount,
    bc.utilized_amount,
    bc.pending_amount,
    bc.available_amount,
    ct.level + 1
  FROM public.budget_categories bc
  INNER JOIN category_tree ct ON bc.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY level, name;
$$ LANGUAGE sql STABLE;

-- Sample data for testing (optional - remove if not needed)
-- Example for Lajja project
-- INSERT INTO public.budget_categories (project_id, parent_id, name, allocated_amount) VALUES
-- ('your-project-id', NULL, 'Admin Cost', 400.00),
-- ('your-project-id', NULL, 'Operation Cost', 400.00),
-- ('your-project-id', NULL, 'HR', 200.00);

-- Sub-categories for Admin Cost
-- INSERT INTO public.budget_categories (project_id, parent_id, name, allocated_amount) VALUES
-- ('your-project-id', 'admin-cost-id', 'Travel', 300.00),
-- ('your-project-id', 'admin-cost-id', 'Food', 100.00);
