import { supabase } from './supabaseClient';
import { deleteToll as deleteTollCascade } from './tollsService';

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
  poc_password?: string | null;
}

// New CSR Partner Toll interface
export interface CSRPartnerToll {
  id: string;
  csr_partner_id: string;
  toll_name?: string;
  poc_name: string;
  contact_number?: string;
  email_id?: string;
  city: string;
  state: string;
  budget_allocation: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  poc_password?: string | null;
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
    return deleteTollCascade(tollId);
  },

  async deletePartnerCascade(partnerId: string): Promise<boolean> {
    const timestamp = new Date().toISOString();
    try {
      const { error: partnerError } = await supabase
        .from('csr_partners')
        .update({ is_active: false, updated_at: timestamp })
        .eq('id', partnerId);

      if (partnerError) throw partnerError;

      const { error: tollError } = await supabase
        .from('csr_partner_tolls')
        .update({ is_active: false, updated_at: timestamp })
        .eq('csr_partner_id', partnerId);

      if (tollError) throw tollError;

      const { error: projectError } = await supabase
        .from('projects')
        .update({ is_active: false, status: 'archived', updated_at: timestamp })
        .eq('csr_partner_id', partnerId);

      if (projectError) throw projectError;

      return true;
    } catch (error) {
      console.error('Error deleting CSR partner cascade:', error);
      return false;
    }
  },
};
