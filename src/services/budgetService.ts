import { supabase } from './supabaseClient';

export interface BudgetAllocation {
  id: string;
  project_id: string;
  category_id: string;
  category_name: string;
  allocated_amount: number;
  utilized_amount: number;
  available_amount: number;
  fiscal_year: string;
  quarter: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetUtilization {
  id: string;
  csr_partner_id: string;
  project_id: string;
  allocated_amount: number;
  utilized_amount: number;
  available_amount: number;
  utilization_percentage: number;
  fiscal_year: string;
  quarter: string;
  created_at: string;
  updated_at: string;
}

export const budgetService = {
  async getAllBudgetAllocations(): Promise<BudgetAllocation[]> {
    try {
      const { data, error } = await supabase
        .from('budget_allocation')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching budget allocations:', error);
      return [];
    }
  },

  async getBudgetAllocationsByProject(projectId: string): Promise<BudgetAllocation[]> {
    try {
      const { data, error } = await supabase
        .from('budget_allocation')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching budget allocations:', error);
      return [];
    }
  },

  async getAllBudgetUtilizations(): Promise<BudgetUtilization[]> {
    try {
      const { data, error } = await supabase
        .from('budget_utilization')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching budget utilization:', error);
      return [];
    }
  },

  async getBudgetUtilizationsByPartner(partnerId: string): Promise<BudgetUtilization[]> {
    try {
      const { data, error } = await supabase
        .from('budget_utilization')
        .select('*')
        .eq('csr_partner_id', partnerId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching budget utilization:', error);
      return [];
    }
  },

  async createBudgetAllocation(budget: Omit<BudgetAllocation, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetAllocation | null> {
    try {
      const { data, error } = await supabase
        .from('budget_allocation')
        .insert([budget])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating budget allocation:', error);
      return null;
    }
  },

  async updateBudgetUtilization(utilizationId: string, updates: Partial<BudgetUtilization>): Promise<BudgetUtilization | null> {
    try {
      const { data, error } = await supabase
        .from('budget_utilization')
        .update(updates)
        .eq('id', utilizationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating budget utilization:', error);
      return null;
    }
  },
};
