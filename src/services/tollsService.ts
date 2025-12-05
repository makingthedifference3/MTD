import { supabase } from './supabaseClient';

/**
 * Toll interface matching the csr_partner_tolls table
 */
export interface Toll {
  id: string;
  csr_partner_id: string;
  toll_name: string | null;
  poc_name: string;
  contact_number: string | null;
  email_id: string | null;
  city: string | null;
  state: string | null;
  budget_allocation: number;
  poc_password?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface TollWithPartner extends Toll {
  csr_partner?: {
    id: string;
    name: string;
    company_name: string;
  };
}

export interface CreateTollInput {
  csr_partner_id: string;
  toll_name: string;
  poc_name: string;
  contact_number?: string;
  email_id?: string;
  city?: string;
  state?: string;
  budget_allocation?: number;
  is_active?: boolean;
  created_by?: string;
  poc_password?: string;
}

export interface UpdateTollInput {
  toll_name?: string;
  poc_name?: string;
  contact_number?: string;
  email_id?: string;
  city?: string;
  state?: string;
  budget_allocation?: number;
  is_active?: boolean;
  updated_by?: string;
  poc_password?: string;
}

/**
 * Get all tolls
 */
export const getAllTolls = async (): Promise<Toll[]> => {
  try {
    const { data, error } = await supabase
      .from('csr_partner_tolls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tolls:', error);
    return [];
  }
};

/**
 * Get tolls by CSR Partner ID
 */
export const getTollsByPartnerId = async (csrPartnerId: string): Promise<Toll[]> => {
  try {
    const { data, error } = await supabase
      .from('csr_partner_tolls')
      .select('*')
      .eq('csr_partner_id', csrPartnerId)
      .eq('is_active', true)
      .order('poc_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tolls for partner:', error);
    return [];
  }
};

/**
 * Get toll by ID
 */
export const getTollById = async (id: string): Promise<Toll | null> => {
  try {
    const { data, error } = await supabase
      .from('csr_partner_tolls')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching toll:', error);
    return null;
  }
};

/**
 * Get toll with partner details
 */
export const getTollWithPartner = async (id: string): Promise<TollWithPartner | null> => {
  try {
    const { data, error } = await supabase
      .from('csr_partner_tolls')
      .select(`
        *,
        csr_partner:csr_partners(id, name, company_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching toll with partner:', error);
    return null;
  }
};

/**
 * Create a new toll
 */
export const createToll = async (input: CreateTollInput): Promise<Toll | null> => {
  try {
    const { data, error } = await supabase
      .from('csr_partner_tolls')
      .insert({
        csr_partner_id: input.csr_partner_id,
        toll_name: input.toll_name,
        poc_name: input.poc_name,
        contact_number: input.contact_number || null,
        email_id: input.email_id || null,
        city: input.city || null,
        state: input.state || null,
        budget_allocation: input.budget_allocation || 0,
        poc_password: input.poc_password || null,
        is_active: input.is_active !== false,
        created_by: input.created_by || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating toll:', error);
    throw error;
  }
};

/**
 * Update a toll
 */
export const updateToll = async (id: string, input: UpdateTollInput): Promise<Toll | null> => {
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.toll_name !== undefined) updateData.toll_name = input.toll_name;
    if (input.poc_name !== undefined) updateData.poc_name = input.poc_name;
    if (input.contact_number !== undefined) updateData.contact_number = input.contact_number || null;
    if (input.email_id !== undefined) updateData.email_id = input.email_id || null;
    if (input.city !== undefined) updateData.city = input.city || null;
    if (input.state !== undefined) updateData.state = input.state || null;
    if (input.budget_allocation !== undefined) updateData.budget_allocation = input.budget_allocation;
    if (input.poc_password !== undefined) updateData.poc_password = input.poc_password || null;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    if (input.updated_by !== undefined) updateData.updated_by = input.updated_by;

    const { data, error } = await supabase
      .from('csr_partner_tolls')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating toll:', error);
    throw error;
  }
};

/**
 * Delete a toll and remove related projects from Supabase
 */
export const deleteToll = async (id: string): Promise<boolean> => {
  try {
    // Collect projects linked to this toll so we can remove dependents
    const { data: projectsForToll, error: projectFetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('toll_id', id);

    if (projectFetchError) throw projectFetchError;

    const projectIds = (projectsForToll || []).map((p) => p.id);

    // Remove project team members tied to those projects to avoid FK issues
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

    // Finally delete the toll itself
    const { error } = await supabase
      .from('csr_partner_tolls')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting toll:', error);
    return false;
  }
};

/**
 * Check if CSR partner has any tolls
 */
export const partnerHasTolls = async (csrPartnerId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('csr_partner_tolls')
      .select('id', { count: 'exact', head: true })
      .eq('csr_partner_id', csrPartnerId)
      .eq('is_active', true);

    if (error) throw error;
    return (count || 0) > 0;
  } catch (error) {
    console.error('Error checking partner tolls:', error);
    return false;
  }
};

/**
 * Get toll count for a partner
 */
export const getTollCountForPartner = async (csrPartnerId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('csr_partner_tolls')
      .select('id', { count: 'exact', head: true })
      .eq('csr_partner_id', csrPartnerId)
      .eq('is_active', true);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting toll count:', error);
    return 0;
  }
};

export const tollsService = {
  getAllTolls,
  getTollsByPartnerId,
  getTollById,
  getTollWithPartner,
  createToll,
  updateToll,
  deleteToll,
  partnerHasTolls,
  getTollCountForPartner,
};

export default tollsService;
