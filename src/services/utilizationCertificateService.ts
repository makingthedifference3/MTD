import { supabase } from './supabaseClient';

export interface UtilizationCertificate {
  id: string;
  certificate_code: string;
  project_id: string;
  csr_partner_id: string;
  certificate_type: 'Quarterly' | 'Annual' | 'Project Completion';
  period_from: string;
  period_to: string;
  fiscal_year: string;
  total_amount: number;
  utilized_amount: number;
  status: 'draft' | 'pending' | 'approved';
  issue_date: string;
  sent_to_partner: boolean;
  sent_date: string | null;
  created_at: string;
  updated_at: string;
}

export const utilizationCertificateService = {
  async getAllCertificates(): Promise<UtilizationCertificate[]> {
    try {
      const { data, error } = await supabase
        .from('utilization_certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  },

  async getCertificatesByProject(projectId: string): Promise<UtilizationCertificate[]> {
    try {
      const { data, error } = await supabase
        .from('utilization_certificates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  },

  async getCertificatesByPartner(partnerId: string): Promise<UtilizationCertificate[]> {
    try {
      const { data, error } = await supabase
        .from('utilization_certificates')
        .select('*')
        .eq('csr_partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  },

  async createCertificate(cert: Omit<UtilizationCertificate, 'id' | 'created_at' | 'updated_at'>): Promise<UtilizationCertificate | null> {
    try {
      const { data, error } = await supabase
        .from('utilization_certificates')
        .insert([cert])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating certificate:', error);
      return null;
    }
  },

  async updateCertificate(certId: string, updates: Partial<UtilizationCertificate>): Promise<UtilizationCertificate | null> {
    try {
      const { data, error } = await supabase
        .from('utilization_certificates')
        .update(updates)
        .eq('id', certId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating certificate:', error);
      return null;
    }
  },
};
