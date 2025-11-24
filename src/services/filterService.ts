import { supabase } from './supabaseClient';

export interface CSRPartner {
  id: string;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  is_active: boolean;
}

export interface Project {
  id: string;
  name: string;
  project_code: string;
  csr_partner_id: string;
  description?: string;
  location?: string;
  state?: string;
  status?: string;
  is_active: boolean;
}

/**
 * Fetch all active CSR partners from Supabase
 */
export const fetchCSRPartners = async (): Promise<CSRPartner[]> => {
  try {
    const { data, error } = await supabase
      .from('csr_partners')
      .select('id, name, company_name, email, phone, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching CSR partners:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching CSR partners:', error);
    return [];
  }
};

/**
 * Fetch projects for a specific CSR partner
 */
export const fetchProjectsByPartner = async (
  partnerId: string
): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(
        'id, name, project_code, csr_partner_id, description, location, state, status, is_active'
      )
      .eq('csr_partner_id', partnerId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching projects:', error);
    return [];
  }
};

/**
 * Fetch all active projects
 */
export const fetchAllProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(
        'id, name, project_code, csr_partner_id, description, location, state, status, is_active'
      )
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching all projects:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching all projects:', error);
    return [];
  }
};

/**
 * Fetch a single project by ID
 */
export const fetchProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(
        'id, name, project_code, csr_partner_id, description, location, state, status, is_active'
      )
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception fetching project:', error);
    return null;
  }
};
