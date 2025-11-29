import { supabase } from './supabaseClient';

export interface CSRPartner {
  id: string;
  name: string;
  company_name: string;
  has_toll: boolean;
  registration_number: string | null;
  pan_number: string | null;
  gst_number: string | null;
  contact_person: string;
  designation: string;
  email: string;
  phone: string;
  alternate_phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  website: string;
  logo_drive_link: string;
  mou_drive_link: string;
  budget_allocated: number;
  budget_utilized: number;
  budget_pending: number;
  fiscal_year: string;
  agreement_start_date: string;
  agreement_end_date: string;
  payment_terms: string;
  billing_cycle: string;
  bank_details: Record<string, string | number>;
  contact_details: Record<string, string | number>;
  documents: Record<string, string | number>;
  is_active: boolean;
  notes: string;
  metadata: Record<string, string | number>;
  poc_password: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CSRPartnerStats {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  activeProjects: number;
  totalBudget: number;
  status: 'active' | 'inactive';
  hasToll: boolean;
}

export interface PartnerStats {
  totalPartners: number;
  activePartners: number;
  totalProjects: number;
  totalBudget: number;
}

/**
 * Get all CSR partners
 */
export const getAllCSRPartners = async (): Promise<CSRPartner[]> => {
  try {
    const { data, error } = await supabase
      .from('csr_partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching CSR partners:', error);
    return [];
  }
};

/**
 * Get CSR partner by ID
 */
export const getCSRPartnerById = async (id: string): Promise<CSRPartner | null> => {
  try {
    const { data, error } = await supabase
      .from('csr_partners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching CSR partner:', error);
    return null;
  }
};

/**
 * Get active CSR partners
 */
export const getActiveCSRPartners = async (): Promise<CSRPartner[]> => {
  try {
    const { data, error } = await supabase
      .from('csr_partners')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active CSR partners:', error);
    return [];
  }
};

/**
 * Search CSR partners by name or city
 */
export const searchCSRPartners = async (searchTerm: string): Promise<CSRPartner[]> => {
  try {
    if (!searchTerm.trim()) {
      return getAllCSRPartners();
    }

    const { data, error } = await supabase
      .from('csr_partners')
      .select('*')
      .or(
        `name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching CSR partners:', error);
    return [];
  }
};

/**
 * Get CSR partners by state
 */
export const getCSRPartnersByState = async (state: string): Promise<CSRPartner[]> => {
  try {
    const { data, error } = await supabase
      .from('csr_partners')
      .select('*')
      .eq('state', state)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching CSR partners by state:', error);
    return [];
  }
};

/**
 * Create new CSR partner
 */
export const createCSRPartner = async (
  data: Omit<CSRPartner, 'id' | 'created_at' | 'updated_at'>
): Promise<CSRPartner> => {
  const { data: result, error } = await supabase
    .from('csr_partners')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating CSR partner:', error);
    throw new Error(error.message || 'Unable to create CSR partner');
  }

  return result as CSRPartner;
};

/**
 * Update CSR partner
 */
export const updateCSRPartner = async (id: string, updates: Partial<CSRPartner>): Promise<CSRPartner | null> => {
  try {
    const { data, error } = await supabase
      .from('csr_partners')
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
    console.error('Error updating CSR partner:', error);
    return null;
  }
};

/**
 * Delete CSR partner
 */
export const deleteCSRPartner = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('csr_partners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting CSR partner:', error);
    return false;
  }
};

/**
 * Get CSR partners with project and budget info
 * Joins with projects table to get active projects count
 */
export const getCSRPartnersWithStats = async (): Promise<CSRPartnerStats[]> => {
  try {
    const { data, error } = await supabase
      .from('csr_partners')
      .select(
        `
        id,
        name,
        company_name,
        has_toll,
        city,
        contact_person,
        phone,
        email,
        budget_allocated,
        is_active,
        projects:projects(id)
      `
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data
    const stats = (data || []).map((partner) => ({
      id: partner.id as string,
      name: (partner.company_name as string) || (partner.name as string) || '—',
      location: (partner.city as string) || 'Unknown',
      contactPerson: (partner.contact_person as string) || 'N/A',
      phone: (partner.phone as string) || 'N/A',
      email: (partner.email as string) || 'N/A',
      activeProjects: (partner.projects as Array<{ id: string }>) ? (partner.projects as Array<{ id: string }>).length : 0,
      totalBudget: (partner.budget_allocated as number) || 0,
      status: 'active' as const,
      hasToll: Boolean(partner.has_toll),
    }));

    return stats;
  } catch (error) {
    console.error('Error fetching CSR partners with stats:', error);
    return [];
  }
};

/**
 * Get comprehensive partner statistics
 */
export const getPartnerStats = async (): Promise<PartnerStats> => {
  try {
    // Get all partners
    const { data: allPartners, error: partnersError } = await supabase
      .from('csr_partners')
      .select('id, is_active, budget_allocated');

    if (partnersError) throw partnersError;

    const partners = (allPartners || []) as Array<{ id: string; is_active: boolean; budget_allocated: number }>;

    // Get all projects
    const { data: allProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id, csr_partner_id');

    if (projectsError) throw projectsError;

    const projects = (allProjects || []) as Array<{ id: string; csr_partner_id: string }>;

    const stats: PartnerStats = {
      totalPartners: partners.length,
      activePartners: partners.filter((p) => p.is_active).length,
      totalProjects: projects.length,
      totalBudget: partners.reduce((sum: number, p) => sum + (p.budget_allocated || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error('Error fetching partner stats:', error);
    return {
      totalPartners: 0,
      activePartners: 0,
      totalProjects: 0,
      totalBudget: 0,
    };
  }
};

/**
 * Get partners with high utilization (>80%)
 */
export const getHighUtilizationPartners = async (): Promise<CSRPartner[]> => {
  try {
    const allPartners = await getAllCSRPartners();
    const highUtilization = allPartners.filter(
      (p) => p.budget_allocated > 0 && (p.budget_utilized / p.budget_allocated) > 0.8
    );

    return highUtilization;
  } catch (error) {
    console.error('Error fetching high utilization partners:', error);
    return [];
  }
};

/**
 * Get partner contact details
 */
export const getPartnerContacts = async (): Promise<{ id: string; name: string; email: string; phone: string }[]> => {
  try {
    const { data, error } = await supabase
      .from('csr_partners')
      .select('id, name, email, phone')
      .eq('is_active', true);

    if (error) throw error;

    return (
      (data || []).map((partner) => ({
        id: partner.id as string,
        name: partner.name as string,
        email: partner.email as string,
        phone: partner.phone as string,
      })) || []
    );
  } catch (error) {
    console.error('Error fetching partner contacts:', error);
    return [];
  }
};

/**
 * Deactivate CSR partner
 */
export const deactivateCSRPartner = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('csr_partners')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deactivating CSR partner:', error);
    return false;
  }
};

/**
 * Activate CSR partner
 */
export const activateCSRPartner = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('csr_partners')
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error activating CSR partner:', error);
    return false;
  }
};
