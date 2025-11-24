import { supabase } from './supabaseClient';

export interface BudgetUtilization {
  id: string;
  csr_partner_id: string;
  project_id: string;
  fiscal_year: string;
  quarter: string;
  month: string;
  allocated_amount: number;
  utilized_amount: number;
  committed_amount: number;
  pending_amount: number;
  available_amount: number;
  utilization_percentage: number;
  date: string;
  description: string;
  notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface BudgetUtilizationHead {
  id: string;
  fundHead: string;
  allocatedAmount: number;
  utilizedAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  projects: number;
}

export interface BudgetUtilizationStats {
  totalAllocated: number;
  totalUtilized: number;
  totalCommitted: number;
  totalPending: number;
  totalAvailable: number;
  overallUtilizationPercentage: number;
  budgetHeads: number;
  totalProjects: number;
}

/**
 * Get all budget utilizations
 */
export const getAllBudgetUtilizations = async (): Promise<BudgetUtilization[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_utilization')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching budget utilizations:', error);
    return [];
  }
};

/**
 * Get budget utilization by ID
 */
export const getBudgetUtilizationById = async (id: string): Promise<BudgetUtilization | null> => {
  try {
    const { data, error } = await supabase
      .from('budget_utilization')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching budget utilization:', error);
    return null;
  }
};

/**
 * Get budget utilizations by CSR Partner
 */
export const getBudgetUtilizationsByPartner = async (partnerId: string): Promise<BudgetUtilization[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_utilization')
      .select('*')
      .eq('csr_partner_id', partnerId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching budget utilizations by partner:', error);
    return [];
  }
};

/**
 * Get budget utilizations by project
 */
export const getBudgetUtilizationsByProject = async (projectId: string): Promise<BudgetUtilization[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_utilization')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching budget utilizations by project:', error);
    return [];
  }
};

/**
 * Get budget utilizations by fiscal year
 */
export const getBudgetUtilizationsByFiscalYear = async (fiscalYear: string): Promise<BudgetUtilization[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_utilization')
      .select('*')
      .eq('fiscal_year', fiscalYear)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching budget utilizations by fiscal year:', error);
    return [];
  }
};

/**
 * Get budget utilizations by quarter
 */
export const getBudgetUtilizationsByQuarter = async (fiscalYear: string, quarter: string): Promise<BudgetUtilization[]> => {
  try {
    const { data, error } = await supabase
      .from('budget_utilization')
      .select('*')
      .eq('fiscal_year', fiscalYear)
      .eq('quarter', quarter)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching budget utilizations by quarter:', error);
    return [];
  }
};

/**
 * Create new budget utilization
 */
export const createBudgetUtilization = async (data: Omit<BudgetUtilization, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetUtilization | null> => {
  try {
    const { data: result, error } = await supabase
      .from('budget_utilization')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating budget utilization:', error);
    return null;
  }
};

/**
 * Update budget utilization
 */
export const updateBudgetUtilization = async (id: string, updates: Partial<BudgetUtilization>): Promise<BudgetUtilization | null> => {
  try {
    const { data, error } = await supabase
      .from('budget_utilization')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating budget utilization:', error);
    return null;
  }
};

/**
 * Delete budget utilization
 */
export const deleteBudgetUtilization = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('budget_utilization')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting budget utilization:', error);
    return false;
  }
};

/**
 * Get budget heads aggregated by fiscal year
 * Groups budget utilizations by fiscal year and calculates totals
 */
export const getBudgetHeadsByYear = async (fiscalYear: string): Promise<BudgetUtilizationHead[]> => {
  try {
    const utilizations = await getBudgetUtilizationsByFiscalYear(fiscalYear);

    // Create a map to aggregate by month
    const headMap = new Map<string, BudgetUtilizationHead>();

    utilizations.forEach((item) => {
      const key = item.month || 'Overall';

      if (!headMap.has(key)) {
        headMap.set(key, {
          id: `head-${key}`,
          fundHead: key,
          allocatedAmount: 0,
          utilizedAmount: 0,
          remainingAmount: 0,
          utilizationPercentage: 0,
          projects: 0,
        });
      }

      const head = headMap.get(key)!;
      head.allocatedAmount += item.allocated_amount || 0;
      head.utilizedAmount += item.utilized_amount || 0;
      head.projects = new Set([...new Set([head.projects]), item.project_id]).size;
    });

    // Calculate derived fields
    const heads = Array.from(headMap.values()).map((head) => ({
      ...head,
      remainingAmount: head.allocatedAmount - head.utilizedAmount,
      utilizationPercentage: head.allocatedAmount > 0 
        ? Math.round((head.utilizedAmount / head.allocatedAmount) * 100)
        : 0,
    }));

    return heads;
  } catch (error) {
    console.error('Error fetching budget heads:', error);
    return [];
  }
};

/**
 * Get comprehensive budget utilization statistics
 */
export const getBudgetUtilizationStats = async (fiscalYear?: string): Promise<BudgetUtilizationStats> => {
  try {
    let query = supabase.from('budget_utilization').select('*');

    if (fiscalYear) {
      query = query.eq('fiscal_year', fiscalYear);
    }

    const { data, error } = await query;

    if (error) throw error;

    const utilizations = data || [];

    const stats: BudgetUtilizationStats = {
      totalAllocated: utilizations.reduce((sum: number, item: BudgetUtilization) => sum + (item.allocated_amount || 0), 0),
      totalUtilized: utilizations.reduce((sum: number, item: BudgetUtilization) => sum + (item.utilized_amount || 0), 0),
      totalCommitted: utilizations.reduce((sum: number, item: BudgetUtilization) => sum + (item.committed_amount || 0), 0),
      totalPending: utilizations.reduce((sum: number, item: BudgetUtilization) => sum + (item.pending_amount || 0), 0),
      totalAvailable: utilizations.reduce((sum: number, item: BudgetUtilization) => sum + (item.available_amount || 0), 0),
      overallUtilizationPercentage: 0,
      budgetHeads: new Set(utilizations.map((item: BudgetUtilization) => item.month)).size,
      totalProjects: new Set(utilizations.map((item: BudgetUtilization) => item.project_id)).size,
    };

    stats.overallUtilizationPercentage =
      stats.totalAllocated > 0
        ? Math.round((stats.totalUtilized / stats.totalAllocated) * 100)
        : 0;

    return stats;
  } catch (error) {
    console.error('Error fetching budget utilization stats:', error);
    return {
      totalAllocated: 0,
      totalUtilized: 0,
      totalCommitted: 0,
      totalPending: 0,
      totalAvailable: 0,
      overallUtilizationPercentage: 0,
      budgetHeads: 0,
      totalProjects: 0,
    };
  }
};

/**
 * Get budget utilization status
 * Returns high utilization and low utilization items
 */
export const getBudgetUtilizationStatus = async (fiscalYear: string): Promise<{
  highUtilization: BudgetUtilization[];
  lowUtilization: BudgetUtilization[];
}> => {
  try {
    const utilizations = await getBudgetUtilizationsByFiscalYear(fiscalYear);

    const highUtilization = utilizations.filter(
      (item) => item.allocated_amount > 0 && (item.utilized_amount / item.allocated_amount) > 0.8
    );

    const lowUtilization = utilizations.filter(
      (item) => item.allocated_amount > 0 && (item.utilized_amount / item.allocated_amount) < 0.3
    );

    return {
      highUtilization,
      lowUtilization,
    };
  } catch (error) {
    console.error('Error fetching budget utilization status:', error);
    return {
      highUtilization: [],
      lowUtilization: [],
    };
  }
};

/**
 * Check budget availability for allocation
 */
export const checkBudgetAvailability = async (partnerId: string, requiredAmount: number): Promise<boolean> => {
  try {
    const utilizations = await getBudgetUtilizationsByPartner(partnerId);
    const totalAvailable = utilizations.reduce((sum, item) => sum + (item.available_amount || 0), 0);
    return totalAvailable >= requiredAmount;
  } catch (error) {
    console.error('Error checking budget availability:', error);
    return false;
  }
};
