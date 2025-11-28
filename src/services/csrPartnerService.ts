import { supabase } from './supabaseClient';

// Updated CSR Partner interface to match new schema
export interface CSRPartner {
  id: string;
  company_name: string;
  city: string;
  state: string;
  website?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// New CSR Partner Toll interface
export interface CSRPartnerToll {
  id: string;
  csr_partner_id: string;
  poc_name: string;
  contact_number?: string;
  email_id?: string;
  city: string;
  state: string;
  budget_allocation: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const csrPartnerService = {
  // CSR Partner methods
  async getAllPartners(): Promise<CSRPartner[]> {
    try {
      const { data, error } = await supabase
        .from('csr_partners')
        .select('*')
        .eq('is_active', true)
        .order('company_name');

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
        .update({ ...updates, updated_at: new Date().toISOString() })
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

  // Toll methods
  async getTollsByPartner(partnerId: string): Promise<CSRPartnerToll[]> {
    try {
      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .select('*')
        .eq('csr_partner_id', partnerId)
        .eq('is_active', true)
        .order('poc_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tolls:', error);
      return [];
    }
  },

  async getTollById(tollId: string): Promise<CSRPartnerToll | null> {
    try {
      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .select('*')
        .eq('id', tollId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching toll:', error);
      return null;
    }
  },

  async createToll(toll: Omit<CSRPartnerToll, 'id' | 'created_at' | 'updated_at'>): Promise<CSRPartnerToll | null> {
    try {
      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .insert([toll])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating toll:', error);
      return null;
    }
  },

  async updateToll(tollId: string, updates: Partial<CSRPartnerToll>): Promise<CSRPartnerToll | null> {
    try {
      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', tollId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating toll:', error);
      return null;
    }
  },

  async deleteToll(tollId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('csr_partner_tolls')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', tollId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting toll:', error);
      return false;
    }
  },
};
