import { supabase } from './supabaseClient';

export interface Expense {
  id: string;
  expense_code: string;
  project_id: string;
  category_id: string;
  date: string;
  description: string;
  total_amount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_by: string;
  created_at: string;
  updated_at: string;
}

export const expenseService = {
  async getAllExpenses(): Promise<Expense[]> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  },

  async getExpensesByProject(projectId: string): Promise<Expense[]> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  },

  async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense | null> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .insert([expense])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating expense:', error);
      return null;
    }
  },

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense | null> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .update(updates)
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating expense:', error);
      return null;
    }
  },

  async deleteExpense(expenseId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  },
};
