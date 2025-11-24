import { supabase } from './supabaseClient';

/**
 * Budget Allocation Service
 * Provides CRUD operations for managing budget allocations by category
 * Data source: budget_allocation table
 */

export interface BudgetAllocation {
  id: string;
  project_id: string;
  category_id: string;
  category_name?: string;
  allocated_amount: number;
  utilized_amount: number;
  pending_amount: number;
  available_amount: number;
  fiscal_year?: string;
  quarter?: string;
  month?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetHead {
  id: string;
  category: string;
  allocated: number;
  utilized: number;
  remaining: number;
  projects: number;
  utilizationPercentage: number;
}

export interface BudgetStats {
  totalAllocated: number;
  totalUtilized: number;
  totalRemaining: number;
  totalPending: number;
  totalAvailable: number;
  utilizationRate: number;
  budgetHeads: number;
  totalProjects: number;
}

// Get all budget allocations
export const getAllBudgetAllocations = async (): Promise<BudgetAllocation[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_allocation')
      .select(
        'id, project_id, category_id, category_name, allocated_amount, utilized_amount, pending_amount, available_amount, fiscal_year, quarter, month, notes, created_at, updated_at'
      )
      .order('category_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching budget allocations:', err);
    throw err;
  }
};

// Get budget allocation by ID
export const getBudgetAllocationById = async (id: string): Promise<BudgetAllocation | null> => {
  try {
    const { data, error } = await supabase
      .from('budget_allocation')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (err) {
    console.error('Error fetching budget allocation:', err);
    throw err;
  }
};

// Get budget allocations by project
export const getBudgetAllocationsByProject = async (projectId: string): Promise<BudgetAllocation[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_allocation')
      .select('*')
      .eq('project_id', projectId)
      .order('category_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching project budget allocations:', err);
    throw err;
  }
};

// Get budget allocations by category
export const getBudgetAllocationsByCategory = async (categoryName: string): Promise<BudgetAllocation[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_allocation')
      .select('*')
      .eq('category_name', categoryName)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching category budget allocations:', err);
    throw err;
  }
};

// Get budget allocations by fiscal year
export const getBudgetAllocationsByFiscalYear = async (fiscalYear: string): Promise<BudgetAllocation[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_allocation')
      .select('*')
      .eq('fiscal_year', fiscalYear)
      .order('category_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching fiscal year budget allocations:', err);
    throw err;
  }
};

// Create a new budget allocation
export const createBudgetAllocation = async (
  allocationData: Omit<BudgetAllocation, 'id' | 'created_at' | 'updated_at'>
): Promise<BudgetAllocation> => {
  try {
    const { data, error } = await supabase
      .from('budget_allocation')
      .insert([allocationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating budget allocation:', err);
    throw err;
  }
};

// Update a budget allocation
export const updateBudgetAllocation = async (
  id: string,
  allocationData: Partial<BudgetAllocation>
): Promise<BudgetAllocation> => {
  try {
    const { data, error } = await supabase
      .from('budget_allocation')
      .update({ ...allocationData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating budget allocation:', err);
    throw err;
  }
};

// Delete a budget allocation
export const deleteBudgetAllocation = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('budget_allocation')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting budget allocation:', err);
    throw err;
  }
};

// Get budget heads summary (grouped by category)
export const getBudgetHeads = async (): Promise<BudgetHead[]> => {
  try {
    const allocations = await getAllBudgetAllocations();

    // Group by category and aggregate
    const categoryMap = new Map<string, BudgetAllocation[]>();
    allocations.forEach((alloc) => {
      const category = alloc.category_name || 'Uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(alloc);
    });

    // Transform to BudgetHead format
    const budgetHeads: BudgetHead[] = Array.from(categoryMap.entries()).map(
      ([category, allocs]) => {
        const allocated = allocs.reduce((sum, a) => sum + (a.allocated_amount || 0), 0);
        const utilized = allocs.reduce((sum, a) => sum + (a.utilized_amount || 0), 0);
        const remaining = allocated - utilized;

        return {
          id: allocs[0].id,
          category,
          allocated,
          utilized,
          remaining,
          projects: allocs.length,
          utilizationPercentage: allocated > 0 ? (utilized / allocated) * 100 : 0,
        };
      }
    );

    return budgetHeads;
  } catch (err) {
    console.error('Error fetching budget heads:', err);
    throw err;
  }
};

// Get comprehensive budget statistics
export const getBudgetStats = async (): Promise<BudgetStats> => {
  try {
    const allocations = await getAllBudgetAllocations();

    const totalAllocated = allocations.reduce((sum, a) => sum + (a.allocated_amount || 0), 0);
    const totalUtilized = allocations.reduce((sum, a) => sum + (a.utilized_amount || 0), 0);
    const totalPending = allocations.reduce((sum, a) => sum + (a.pending_amount || 0), 0);
    const totalAvailable = allocations.reduce((sum, a) => sum + (a.available_amount || 0), 0);
    const totalRemaining = totalAllocated - totalUtilized;

    // Get unique categories (budget heads)
    const budgetHeads = new Set(allocations.map((a) => a.category_name)).size;

    // Get total unique projects
    const totalProjects = new Set(allocations.map((a) => a.project_id)).size;

    const stats: BudgetStats = {
      totalAllocated,
      totalUtilized,
      totalRemaining,
      totalPending,
      totalAvailable,
      utilizationRate: totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0,
      budgetHeads,
      totalProjects,
    };

    return stats;
  } catch (err) {
    console.error('Error fetching budget stats:', err);
    throw err;
  }
};

// Get budget allocations for a specific quarter
export const getBudgetAllocationsByQuarter = async (
  fiscalYear: string,
  quarter: string
): Promise<BudgetAllocation[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_allocation')
      .select('*')
      .eq('fiscal_year', fiscalYear)
      .eq('quarter', quarter)
      .order('category_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching quarterly budget allocations:', err);
    throw err;
  }
};

// Get budget allocations for a specific month
export const getBudgetAllocationsByMonth = async (month: string): Promise<BudgetAllocation[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_allocation')
      .select('*')
      .eq('month', month)
      .order('category_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching monthly budget allocations:', err);
    throw err;
  }
};

// Check if available amount is sufficient
export const checkBudgetAvailability = async (
  categoryId: string,
  requiredAmount: number
): Promise<boolean> => {
  try {
    const allocations = await supabase
      .from('budget_allocation')
      .select('available_amount')
      .eq('category_id', categoryId);

    if (allocations.error) throw allocations.error;

    const totalAvailable = allocations.data?.reduce(
      (sum, alloc) => sum + (alloc.available_amount || 0),
      0
    ) || 0;

    return totalAvailable >= requiredAmount;
  } catch (err) {
    console.error('Error checking budget availability:', err);
    throw err;
  }
};
