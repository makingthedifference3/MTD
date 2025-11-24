import { supabase } from './supabaseClient';

export interface ProjectExpense {
  id: string;
  expense_code: string;
  project_id: string;
  category_id: string;
  task_id: string | null;
  merchant_name: string;
  merchant_contact: string;
  merchant_address: string;
  merchant_gstin: string;
  merchant_pan: string;
  date: string;
  category: string;
  sub_category: string;
  description: string;
  purpose: string;
  base_amount: number;
  tax_amount: number;
  gst_percentage: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  other_charges: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'Cash' | 'Cheque' | 'Online' | 'Card';
  payment_reference: string;
  payment_date: string;
  paid_to: string;
  bank_details: Record<string, unknown>;
  bill_drive_link: string;
  invoice_drive_link: string;
  receipt_drive_link: string;
  supporting_docs: Record<string, unknown>;
  status: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'reimbursed';
  submitted_by: string;
  submitted_date: string;
  reviewed_by: string | null;
  reviewed_date: string | null;
  approved_by: string | null;
  approved_date: string | null;
  rejection_reason: string | null;
  reimbursed_date: string | null;
  account_code: string;
  gl_code: string;
  cost_center: string;
  is_reimbursable: boolean;
  reimbursed_to: string;
  approval_chain: Record<string, unknown>;
  current_approver: string | null;
  priority: string;
  tags: string[];
  notes: string;
  internal_notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
}

export interface ExpenseDisplay {
  id: string;
  merchantName: string;
  date: string;
  submittedBy: string;
  category: string;
  totalAmount: number;
  status: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'reimbursed';
  receiptLink: string;
  description: string;
}

export interface ExpenseStats {
  pendingCount: number;
  pendingAmount: number;
  approvedCount: number;
  approvedAmount: number;
  rejectedCount: number;
  rejectedAmount: number;
  totalExpenses: number;
  totalAmount: number;
}

export interface ExpenseApproval {
  id: string;
  expense_id: string;
  approver_id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'requested_changes';
  previous_status: string;
  new_status: string;
  comments: string;
  attachments: Record<string, unknown>;
  created_at: string;
}

/**
 * Get all expenses
 */
export const getAllExpenses = async (): Promise<ProjectExpense[]> => {
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
};

/**
 * Get expenses by status
 */
export const getExpensesByStatus = async (status: string): Promise<ProjectExpense[]> => {
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
};

/**
 * Get expenses with user details
 */
export const getExpensesWithDetails = async (): Promise<ExpenseDisplay[]> => {
  try {
    interface ExpenseWithUser {
      id: string;
      merchant_name: string;
      date: string;
      submitted_by: string;
      category: string;
      total_amount: number;
      status: string;
      receipt_drive_link: string;
      description: string;
      users: Array<{ full_name: string }>;
    }

    const { data, error } = await supabase
      .from('project_expenses')
      .select(
        `
        id,
        merchant_name,
        date,
        submitted_by,
        category,
        total_amount,
        status,
        receipt_drive_link,
        description,
        users:submitted_by(full_name)
      `
      )
      .order('date', { ascending: false });

    if (error) throw error;

    const expenses = ((data as unknown as ExpenseWithUser[]) || []).map((expense) => ({
      id: expense.id,
      merchantName: expense.merchant_name,
      date: expense.date,
      submittedBy: expense.users?.[0]?.full_name || 'Unknown User',
      category: expense.category,
      totalAmount: expense.total_amount,
      status: expense.status as 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'reimbursed',
      receiptLink: expense.receipt_drive_link,
      description: expense.description,
    })) as ExpenseDisplay[];

    return expenses;
  } catch (error) {
    console.error('Error fetching expenses with details:', error);
    return [];
  }
};

/**
 * Get expense by ID
 */
export const getExpenseById = async (id: string): Promise<ProjectExpense | null> => {
  try {
    const { data, error } = await supabase
      .from('project_expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching expense:', error);
    return null;
  }
};

/**
 * Create new expense claim
 */
export const createExpenseClaim = async (
  data: Omit<ProjectExpense, 'id' | 'created_at' | 'updated_at' | 'updated_by'>
): Promise<ProjectExpense | null> => {
  try {
    const { data: result, error } = await supabase
      .from('project_expenses')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating expense claim:', error);
    return null;
  }
};

/**
 * Update expense
 */
export const updateExpense = async (id: string, updates: Partial<ProjectExpense>): Promise<ProjectExpense | null> => {
  try {
    const { data, error } = await supabase
      .from('project_expenses')
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
    console.error('Error updating expense:', error);
    return null;
  }
};

/**
 * Delete expense
 */
export const deleteExpense = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('project_expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
};

/**
 * Approve expense
 */
export const approveExpense = async (id: string, approvedBy: string): Promise<ProjectExpense | null> => {
  try {
    const { data, error } = await supabase
      .from('project_expenses')
      .update({
        status: 'approved' as const,
        approved_by: approvedBy,
        approved_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error approving expense:', error);
    return null;
  }
};

/**
 * Reject expense
 */
export const rejectExpense = async (id: string, rejectionReason: string, rejectedBy: string): Promise<ProjectExpense | null> => {
  try {
    const { data, error } = await supabase
      .from('project_expenses')
      .update({
        status: 'rejected' as const,
        rejection_reason: rejectionReason,
        reviewed_by: rejectedBy,
        reviewed_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error rejecting expense:', error);
    return null;
  }
};

/**
 * Get expense statistics
 */
export const getExpenseStats = async (): Promise<ExpenseStats> => {
  try {
    const { data, error } = await supabase
      .from('project_expenses')
      .select('status, total_amount');

    if (error) throw error;

    const expenses = (data || []) as Array<{ status: string; total_amount: number }>;

    const stats: ExpenseStats = {
      pendingCount: expenses.filter((e) => e.status === 'pending').length,
      pendingAmount: expenses
        .filter((e) => e.status === 'pending')
        .reduce((sum, e) => sum + e.total_amount, 0),
      approvedCount: expenses.filter((e) => e.status === 'approved').length,
      approvedAmount: expenses
        .filter((e) => e.status === 'approved')
        .reduce((sum, e) => sum + e.total_amount, 0),
      rejectedCount: expenses.filter((e) => e.status === 'rejected').length,
      rejectedAmount: expenses
        .filter((e) => e.status === 'rejected')
        .reduce((sum, e) => sum + e.total_amount, 0),
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, e) => sum + e.total_amount, 0),
    };

    return stats;
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    return {
      pendingCount: 0,
      pendingAmount: 0,
      approvedCount: 0,
      approvedAmount: 0,
      rejectedCount: 0,
      rejectedAmount: 0,
      totalExpenses: 0,
      totalAmount: 0,
    };
  }
};

/**
 * Create expense approval record
 */
export const createExpenseApproval = async (
  data: Omit<ExpenseApproval, 'id' | 'created_at'>
): Promise<ExpenseApproval | null> => {
  try {
    const { data: result, error } = await supabase
      .from('expense_approvals')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating expense approval:', error);
    return null;
  }
};

/**
 * Get pending expenses (awaiting approval)
 */
export const getPendingExpenses = async (): Promise<ProjectExpense[]> => {
  try {
    const { data, error } = await supabase
      .from('project_expenses')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending expenses:', error);
    return [];
  }
};

/**
 * Get expense approvals for a specific expense
 */
export const getExpenseApprovals = async (expenseId: string): Promise<ExpenseApproval[]> => {
  try {
    const { data, error } = await supabase
      .from('expense_approvals')
      .select('*')
      .eq('expense_id', expenseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching expense approvals:', error);
    return [];
  }
};

/**
 * Submit expense for review
 */
export const submitExpense = async (id: string, submittedBy: string): Promise<ProjectExpense | null> => {
  try {
    const { data, error } = await supabase
      .from('project_expenses')
      .update({
        status: 'submitted' as const,
        submitted_by: submittedBy,
        submitted_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error submitting expense:', error);
    return null;
  }
};

/**
 * Get expenses by date range
 */
export const getExpensesByDateRange = async (startDate: string, endDate: string): Promise<ProjectExpense[]> => {
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
};

/**
 * Get expenses by project
 */
export const getExpensesByProject = async (projectId: string): Promise<ProjectExpense[]> => {
  try {
    const { data, error } = await supabase
      .from('project_expenses')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching expenses by project:', error);
    return [];
  }
};
