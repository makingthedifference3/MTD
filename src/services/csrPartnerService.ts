import { supabase } from './supabaseClient';

export interface CSRPartner {
  id: string;
  name: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  budget_allocated: number;
  budget_utilized: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const csrPartnerService = {
  async getAllPartners(): Promise<CSRPartner[]> {
    try {
      const { data, error } = await supabase
        .from('csr_partners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching CSR partners:', error);
      return [];
    }
  },

  async getPartnerById(partnerId: string): Promise<CSRPartner | null> {
    try {
      const { data, error } = await supabase
        .from('csr_partners')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching partner:', error);
      return null;
    }
  },

  async createPartner(partner: Omit<CSRPartner, 'id' | 'created_at' | 'updated_at'>): Promise<CSRPartner | null> {
    try {
      const { data, error } = await supabase
        .from('csr_partners')
        .insert([partner])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating partner:', error);
      return null;
    }
  },

  async updatePartner(partnerId: string, updates: Partial<CSRPartner>): Promise<CSRPartner | null> {
    try {
      const { data, error } = await supabase
        .from('csr_partners')
        .update(updates)
        .eq('id', partnerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating partner:', error);
      return null;
    }
  },
};
