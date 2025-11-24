import { supabase } from './supabaseClient';

export interface Bill {
  id: string;
  bill_code: string;
  project_id: string;
  bill_type: 'Invoice' | 'Receipt' | 'Estimate';
  vendor_name: string;
  date: string;
  total_amount: number;
  status: 'pending' | 'approved' | 'paid';
  created_at: string;
  updated_at: string;
}

export const billService = {
  async getAllBills(): Promise<Bill[]> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bills:', error);
      return [];
    }
  },

  async getBillsByProject(projectId: string): Promise<Bill[]> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bills:', error);
      return [];
    }
  },

  async createBill(bill: Omit<Bill, 'id' | 'created_at' | 'updated_at'>): Promise<Bill | null> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .insert([bill])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating bill:', error);
      return null;
    }
  },

  async updateBill(billId: string, updates: Partial<Bill>): Promise<Bill | null> {
    try {
      const { data, error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', billId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating bill:', error);
      return null;
    }
  },
};
