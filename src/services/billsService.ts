import { supabase } from './supabaseClient';

/**
 * Bills Service
 * Provides CRUD operations for managing bills and invoices
 * Data source: bills table
 */

export interface Bill {
  id: string;
  bill_code: string;
  project_id?: string;
  expense_id?: string;
  bill_overview?: string;
  bill_type?: 'Invoice' | 'Receipt' | 'Estimate';
  bill_number?: string;
  vendor_name?: string;
  vendor_gstin?: string;
  date?: string;
  due_date?: string;
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  amount_paid?: number;
  balance_amount?: number;
  status?: 'pending' | 'approved' | 'paid';
  bill_drive_link?: string;
  payment_terms?: string;
  payment_method?: string;
  payment_reference?: string;
  submitted_by?: string;
  approved_by?: string | null;
  paid_by?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface BillStats {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  totalAmount: number;
  paidAmount: number;
}

// Get all bills with optional filtering
export const getAllBills = async (
  status?: 'pending' | 'approved' | 'paid'
): Promise<Bill[]> => {
  try {
    let query = supabase
      .from('bills')
      .select(
        'id, bill_code, project_id, expense_id, bill_overview, bill_type, bill_number, vendor_name, vendor_gstin, date, due_date, subtotal, tax_amount, total_amount, amount_paid, balance_amount, status, bill_drive_link, payment_terms, payment_method, payment_reference, submitted_by, approved_by, paid_by, notes, created_at, updated_at, created_by'
      );

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching bills:', err);
    throw err;
  }
};

// Get bill by ID
export const getBillById = async (id: string): Promise<Bill | null> => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (err) {
    console.error('Error fetching bill:', err);
    throw err;
  }
};

// Get bills by project
export const getBillsByProject = async (projectId: string): Promise<Bill[]> => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching project bills:', err);
    throw err;
  }
};

// Create a new bill
export const createBill = async (billData: Omit<Bill, 'id' | 'created_at' | 'updated_at'>): Promise<Bill> => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .insert([billData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating bill:', err);
    throw err;
  }
};

// Update a bill
export const updateBill = async (id: string, billData: Partial<Bill>): Promise<Bill> => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .update({ ...billData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating bill:', err);
    throw err;
  }
};

// Update bill status
export const updateBillStatus = async (
  id: string,
  status: 'pending' | 'approved' | 'paid',
  approvedBy?: string
): Promise<Bill> => {
  try {
    const updatePayload: Partial<Bill> & { updated_at: string } = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'approved' && approvedBy) {
      updatePayload.approved_by = approvedBy;
    }
    if (status === 'paid' && approvedBy) {
      updatePayload.paid_by = approvedBy;
      const bill = await getBillById(id);
      updatePayload.amount_paid = bill?.total_amount || 0;
    }

    const { data, error } = await supabase
      .from('bills')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating bill status:', err);
    throw err;
  }
};

// Delete a bill
export const deleteBill = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting bill:', err);
    throw err;
  }
};

// Get bill statistics
export const getBillStats = async (): Promise<BillStats> => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('status, total_amount, amount_paid');

    if (error) throw error;

    const stats: BillStats = {
      total: data?.length || 0,
      pending: data?.filter((b) => b.status === 'pending').length || 0,
      approved: data?.filter((b) => b.status === 'approved').length || 0,
      paid: data?.filter((b) => b.status === 'paid').length || 0,
      totalAmount: data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
      paidAmount: data?.reduce((sum, b) => sum + (b.amount_paid || 0), 0) || 0,
    };

    return stats;
  } catch (err) {
    console.error('Error fetching bill stats:', err);
    throw err;
  }
};

// Get bills by date range
export const getBillsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<Bill[]> => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching bills by date range:', err);
    throw err;
  }
};

// Get bills by vendor
export const getBillsByVendor = async (vendorName: string): Promise<Bill[]> => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('vendor_name', vendorName)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching vendor bills:', err);
    throw err;
  }
};
