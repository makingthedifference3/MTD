import { supabase } from './supabaseClient';

export interface UtilizationCertificate {
  id: string;
  certificate_code: string;
  project_id: string;
  csr_partner_id: string;
  certificate_heading?: string;
  certificate_type: 'Quarterly' | 'Annual' | 'Project Completion' | 'Half-Yearly' | 'Project-Specific';
  period_from?: string;
  period_to?: string;
  fiscal_year?: string;
  total_amount?: number;
  utilized_amount?: number;
  certificate_drive_link?: string;
  annexure_drive_link?: string;
  supporting_docs?: Record<string, unknown>;
  format_type?: string;
  issue_date?: string;
  prepared_by?: string;
  reviewed_by?: string;
  approved_by?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  sent_to_partner?: boolean;
  sent_date?: string;
  acknowledged?: boolean;
  acknowledgment_date?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  // Joined fields
  csr_partners?: { id: string; name: string };
  projects?: { id: string; name: string; project_code: string };
  prepared_user?: { full_name: string };
  reviewed_user?: { full_name: string };
  approved_user?: { full_name: string };
}

export interface CertificateWithRelations extends UtilizationCertificate {
  csr_partners: { id: string; name: string };
  projects: { id: string; name: string; project_code: string };
}

export const utilizationCertificateService = {
  async getAllCertificates(): Promise<CertificateWithRelations[]> {
    try {
      const { data, error } = await supabase
        .from('utilization_certificates')
        .select(`
          *,
          csr_partners(id, name),
          projects(id, name, project_code)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as CertificateWithRelations[];
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  },

  async getCertificatesByProject(projectId: string): Promise<CertificateWithRelations[]> {
    try {
      const { data, error } = await supabase
        .from('utilization_certificates')
        .select(`
          *,
          csr_partners(id, name),
          projects(id, name, project_code)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as CertificateWithRelations[];
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  },

  async getCertificatesByPartner(partnerId: string): Promise<CertificateWithRelations[]> {
    try {
      const { data, error } = await supabase
        .from('utilization_certificates')
        .select(`
          *,
          csr_partners(id, name),
          projects(id, name, project_code)
        `)
        .eq('csr_partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as CertificateWithRelations[];
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  },

  async getCertificateById(certId: string): Promise<CertificateWithRelations | null> {
    try {
      const { data, error } = await supabase
        .from('utilization_certificates')
        .select(`
          *,
          csr_partners(id, name),
          projects(id, name, project_code)
        `)
        .eq('id', certId)
        .single();

      if (error) throw error;
      return data as CertificateWithRelations;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      return null;
    }
  },

  async createCertificate(cert: Partial<UtilizationCertificate>): Promise<UtilizationCertificate | null> {
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
      throw error;
    }
  },

  async updateCertificate(certId: string, updates: Partial<UtilizationCertificate>): Promise<UtilizationCertificate | null> {
    try {
      const { data, error } = await supabase
        .from('utilization_certificates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', certId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating certificate:', error);
      throw error;
    }
  },

  async deleteCertificate(certId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('utilization_certificates')
        .delete()
        .eq('id', certId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting certificate:', error);
      return false;
    }
  },

  async updateStatus(certId: string, status: UtilizationCertificate['status'], userId?: string): Promise<boolean> {
    try {
      const updates: Partial<UtilizationCertificate> = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'approved' && userId) {
        updates.approved_by = userId;
      }

      const { error } = await supabase
        .from('utilization_certificates')
        .update(updates)
        .eq('id', certId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  },

  async markAsSentToPartner(certId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('utilization_certificates')
        .update({ 
          sent_to_partner: true, 
          sent_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', certId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking as sent:', error);
      return false;
    }
  },

  async markAsAcknowledged(certId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('utilization_certificates')
        .update({ 
          acknowledged: true, 
          acknowledgment_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', certId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking as acknowledged:', error);
      return false;
    }
  },

  generateCertificateCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `UC-${timestamp}-${random}`;
  }
};
