import { supabase } from './supabaseClient';

export interface BudgetCategory {
  id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  allocated_amount: number;
  utilized_amount: number;
  pending_amount: number;
  available_amount: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface BudgetCategoryInput {
  project_id: string;
  parent_id?: string | null;
  name: string;
  allocated_amount: number;
  utilized_amount?: number;
  created_by?: string;
}

export interface BudgetCategoryTree extends BudgetCategory {
  children?: BudgetCategoryTree[];
  level: number;
}

// Fetch all budget categories for a project
export async function getBudgetCategoriesByProject(projectId: string): Promise<BudgetCategory[]> {
  const { data, error } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching budget categories:', error);
    throw error;
  }

  return data || [];
}

// Get budget category tree (hierarchical structure)
export async function getBudgetCategoryTree(projectId: string): Promise<BudgetCategoryTree[]> {
  const categories = await getBudgetCategoriesByProject(projectId);
  
  // Build tree structure
  const categoryMap = new Map<string, BudgetCategoryTree>();
  const rootCategories: BudgetCategoryTree[] = [];

  // First pass: create all nodes
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [], level: 0 });
  });

  // Second pass: build tree
  categories.forEach(cat => {
    const node = categoryMap.get(cat.id)!;
    if (cat.parent_id) {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
        node.level = parent.level + 1;
      }
    } else {
      rootCategories.push(node);
    }
  });

  return rootCategories;
}

// Create a budget category
export async function createBudgetCategory(category: BudgetCategoryInput): Promise<BudgetCategory> {
  const { data, error } = await supabase
    .from('budget_categories')
    .insert([category])
    .select()
    .single();

  if (error) {
    console.error('Error creating budget category:', error);
    throw error;
  }

  return data;
}

// Create multiple budget categories (batch)
export async function createBudgetCategories(categories: BudgetCategoryInput[]): Promise<BudgetCategory[]> {
  const { data, error } = await supabase
    .from('budget_categories')
    .insert(categories)
    .select();

  if (error) {
    console.error('Error creating budget categories:', error);
    throw error;
  }

  return data || [];
}

// Update a budget category
export async function updateBudgetCategory(
  id: string,
  updates: Partial<BudgetCategoryInput>
): Promise<BudgetCategory> {
  const { data, error } = await supabase
    .from('budget_categories')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating budget category:', error);
    throw error;
  }

  return data;
}

// Delete a budget category (will cascade to children)
export async function deleteBudgetCategory(id: string): Promise<void> {
  // First check if this budget category is referenced by any expenses
  const { data: expensesWithCategory, error: checkError } = await supabase
    .from('project_expenses')
    .select('id')
    .eq('budget_category_id', id)
    .limit(1);

  if (checkError) {
    console.error('Error checking budget category references:', checkError);
    // Don't throw - just return to prevent blocking
    return;
  }

  // If expenses exist with this category, don't delete it
  if (expensesWithCategory && expensesWithCategory.length > 0) {
    console.warn(`Cannot delete budget category ${id} - it has ${expensesWithCategory.length} associated expense(s)`);
    // Silently return without error to prevent blocking project save
    return;
  }

  const { error } = await supabase
    .from('budget_categories')
    .delete()
    .eq('id', id);

  if (error) {
    // Check if it's a foreign key constraint error
    if (error.code === '23503') {
      console.warn(`Cannot delete budget category ${id} - foreign key constraint (has related data)`);
      // Don't throw - just return to prevent blocking project save
      return;
    }
    console.error('Error deleting budget category:', error);
    throw error;
  }
}

// Validate that allocated amounts don't exceed total budget
export function validateBudgetAllocation(
  categories: Array<{ allocated_amount: number; parent_id?: string | null }>,
  totalBudget: number
): { isValid: boolean; error?: string } {
  // Get root categories (no parent)
  const rootCategories = categories.filter(cat => !cat.parent_id);
  const totalAllocated = rootCategories.reduce((sum, cat) => sum + cat.allocated_amount, 0);

  if (totalAllocated > totalBudget) {
    return {
      isValid: false,
      error: `Total allocated (₹${totalAllocated.toLocaleString()}) exceeds project budget (₹${totalBudget.toLocaleString()})`
    };
  }

  return { isValid: true };
}

// Validate that child categories don't exceed parent allocation
export function validateChildAllocation(
  parentAmount: number,
  children: Array<{ allocated_amount: number }>
): { isValid: boolean; error?: string } {
  const totalChildAmount = children.reduce((sum, child) => sum + child.allocated_amount, 0);

  if (totalChildAmount > parentAmount) {
    return {
      isValid: false,
      error: `Child categories total (₹${totalChildAmount.toLocaleString()}) exceeds parent allocation (₹${parentAmount.toLocaleString()})`
    };
  }

  return { isValid: true };
}
