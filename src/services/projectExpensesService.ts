import { supabase } from './supabaseClient';

export interface ProjectExpense {
  id: string;
  expense_code: string;
  project_id: string;
  category_id: string;
  task_id?: string;
  merchant_name: string;
  merchant_contact?: string;
  date: string;
  category: string;
  sub_category?: string;
  description: string;
  purpose?: string;
  total_amount: number;
  base_amount: number;
  tax_amount?: number;
  status: 'draft' | 'submitted' | 'pending' | 'accepted' | 'approved' | 'rejected' | 'reimbursed' | 'paid';
  payment_method: 'Cash' | 'Cheque' | 'Online' | 'Card';
  submitted_by?: string;
  approved_by?: string;
  rejection_reason?: string;
  csr_partner_id?: string;
  toll_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseStats {
  total: number;
  pending: number;
  accepted: number;
  approved: number;
  rejected: number;
  paid: number;
  totalAmount: number;
  pendingAmount: number;
  acceptedAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  paidAmount: number;
}

export interface ExpenseSummary {
  id: string;
  expense_code: string;
  project_name: string;
  category: string;
  amount: number;
  date: string;
  submitted_by: string;
  status: 'draft' | 'submitted' | 'pending' | 'accepted' | 'approved' | 'rejected' | 'reimbursed' | 'paid';
  description: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
}

export const projectExpensesService = {
  async getAllExpenses(): Promise<ProjectExpense[]> {
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

  async getExpensesByProject(projectId: string): Promise<ProjectExpense[]> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching project expenses:', error);
      return [];
    }
  },

  async getExpensesByStatus(status: string): Promise<ProjectExpense[]> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expenses by status:', error);
      return [];
    }
  },

  async getExpenseWithDetails(expenseId: string): Promise<ProjectExpense | null> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .eq('id', expenseId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching expense:', error);
      return null;
    }
  },

  async getExpenseStats(expenses: ProjectExpense[]): Promise<ExpenseStats> {
    try {
      const total = expenses.length;
      const pending = expenses.filter(e => e.status === 'pending' || e.status === 'submitted').length;
      const accepted = expenses.filter(e => e.status === 'accepted').length;
      const approved = expenses.filter(e => e.status === 'approved').length;
      const rejected = expenses.filter(e => e.status === 'rejected').length;
      const paid = expenses.filter(e => e.status === 'paid').length;

      const totalAmount = expenses.reduce((sum, e) => sum + e.total_amount, 0);
      const pendingAmount = expenses
        .filter(e => e.status === 'pending' || e.status === 'submitted')
        .reduce((sum, e) => sum + e.total_amount, 0);
      const acceptedAmount = expenses
        .filter(e => e.status === 'accepted')
        .reduce((sum, e) => sum + e.total_amount, 0);
      const approvedAmount = expenses
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + e.total_amount, 0);
      const rejectedAmount = expenses
        .filter(e => e.status === 'rejected')
        .reduce((sum, e) => sum + e.total_amount, 0);
      const paidAmount = expenses
        .filter(e => e.status === 'paid')
        .reduce((sum, e) => sum + e.total_amount, 0);

      return {
        total,
        pending,
        accepted,
        approved,
        rejected,
        paid,
        totalAmount,
        pendingAmount,
        acceptedAmount,
        approvedAmount,
        rejectedAmount,
        paidAmount,
      };
    } catch (error) {
      console.error('Error calculating expense stats:', error);
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        approved: 0,
        rejected: 0,
        paid: 0,
        totalAmount: 0,
        pendingAmount: 0,
        acceptedAmount: 0,
        approvedAmount: 0,
        rejectedAmount: 0,
        paidAmount: 0,
      };
    }
  },

  async getExpenseSummaries(expenses: ProjectExpense[], projects: Map<string, string> = new Map()): Promise<ExpenseSummary[]> {
    try {
      return expenses.map(expense => ({
        id: expense.id,
        expense_code: expense.expense_code,
        project_name: projects.get(expense.project_id) || 'Unknown Project',
        category: expense.category,
        amount: expense.total_amount,
        date: expense.date,
        submitted_by: expense.submitted_by || 'N/A',
        status: expense.status,
        description: expense.description,
      }));
    } catch (error) {
      console.error('Error generating expense summaries:', error);
      return [];
    }
  },

  async updateExpenseStatus(expenseId: string, newStatus: string, comments?: string): Promise<ProjectExpense | null> {
    try {
      const updates: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (comments && newStatus === 'rejected') {
        updates.rejection_reason = comments;
      }

      const { data, error } = await supabase
        .from('project_expenses')
        .update(updates)
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating expense status:', error);
      return null;
    }
  },

  async approveExpense(expenseId: string, approvedBy: string): Promise<ProjectExpense | null> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving expense:', error);
      return null;
    }
  },

  async rejectExpense(expenseId: string, rejectionReason: string): Promise<ProjectExpense | null> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error rejecting expense:', error);
      return null;
    }
  },

  async acceptExpense(expenseId: string, acceptedBy: string): Promise<ProjectExpense | null> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      console.log('Expense accepted by:', acceptedBy);
      return data;
    } catch (error) {
      console.error('Error accepting expense:', error);
      return null;
    }
  },

  async getAcceptedExpenses(): Promise<ProjectExpense[]> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching accepted expenses:', error);
      return [];
    }
  },

  async markAsPaid(expenseId: string, paidBy: string): Promise<ProjectExpense | null> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      
      // Note: paidBy parameter kept for future use when paid_by field is added to schema
      console.log('Expense marked as paid by:', paidBy);
      
      return data;
    } catch (error) {
      console.error('Error marking expense as paid:', error);
      return null;
    }
  },

  async submitExpense(expenseId: string, submittedBy: string): Promise<ProjectExpense | null> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .update({
          status: 'submitted',
          submitted_by: submittedBy,
          submitted_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting expense:', error);
      return null;
    }
  },

  async createExpense(expense: Omit<ProjectExpense, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectExpense | null> {
    try {
      console.log('Service received expense data:', JSON.stringify(expense, null, 2));
      console.log('category_id in service:', expense.category_id);
      
      const { data, error } = await supabase
        .from('project_expenses')
        .insert([expense])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating expense:', error);
      return null;
    }
  },

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<ProjectExpense[]> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expenses by date range:', error);
      return [];
    }
  },

  async searchExpenses(query: string): Promise<ProjectExpense[]> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .or(`expense_code.ilike.%${query}%,merchant_name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching expenses:', error);
      return [];
    }
  },

  async getExpensesByCategory(categoryId: string): Promise<ProjectExpense[]> {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expenses by category:', error);
      return [];
    }
  },

  async getUpcomingExpenses(): Promise<ProjectExpense[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .gte('date', today)
        .in('status', ['draft', 'submitted', 'pending'])
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming expenses:', error);
      return [];
    }
  },

  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      return [];
    }
  },
};
