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
    try {
      // Collect projects for this partner
      const { data: partnerProjects, error: projectFetchError } = await supabase
        .from('projects')
        .select('id')
        .eq('csr_partner_id', partnerId);

      if (projectFetchError) throw projectFetchError;

      const projectIds = (partnerProjects || []).map((p) => p.id);

      // Remove project team members tied to partner's projects
      if (projectIds.length > 0) {
        const { error: ptmDeleteError } = await supabase
          .from('project_team_members')
          .delete()
          .in('project_id', projectIds);

        if (ptmDeleteError) throw ptmDeleteError;

        const { error: projectsDeleteError } = await supabase
          .from('projects')
          .delete()
          .in('id', projectIds);

        if (projectsDeleteError) throw projectsDeleteError;
      }

      // Delete tolls for partner
      const { data: partnerTolls, error: tollFetchError } = await supabase
        .from('csr_partner_tolls')
        .select('id')
        .eq('csr_partner_id', partnerId);

      if (tollFetchError) throw tollFetchError;

      if ((partnerTolls || []).length > 0) {
        const tollIds = partnerTolls.map((toll) => toll.id);
        const { error: tollDeleteError } = await supabase
          .from('csr_partner_tolls')
          .delete()
          .in('id', tollIds);

        if (tollDeleteError) throw tollDeleteError;
      }

      // Delete partner itself
      const { error: partnerDeleteError } = await supabase
        .from('csr_partners')
        .delete()
        .eq('id', partnerId);

      if (partnerDeleteError) throw partnerDeleteError;

      return true;
    } catch (error) {
      console.error('Error deleting CSR partner cascade:', error);
      return false;
    }
  },
};
