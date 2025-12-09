import { supabase } from './supabaseClient';
import type { ImpactMetricEntry } from '../utils/impactMetrics';

const PROJECT_SELECT_FIELDS = `
  id,
  name,
  project_code,
  logo_url,
  csr_partner_id,
  toll_id,
  description,
  location,
  state,
  work,
  start_date,
  expected_end_date,
  status,
  is_active,
  total_budget,
  utilized_budget,
  total_beneficiaries,
  direct_beneficiaries,
  beneficiary_type,
  beneficiary_name,
  metadata,
  impact_metrics,
  meals_served,
  pads_distributed,
  trees_planted,
  students_enrolled,
  schools_renovated,
  uc_link,
  toll:csr_partner_tolls!projects_toll_id_fkey(id, toll_name, poc_name, city, state)
`;

const normalizeTollRelation = (records: Project[]): Project[] =>
  records.map((record) => {
    if (record.toll && Array.isArray(record.toll)) {
      return { ...record, toll: record.toll[0] || null };
    }
    return record;
  });

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
  toll_id?: string;
  toll?: {
    id: string;
    toll_name?: string | null;
    poc_name?: string | null;
    city?: string | null;
    state?: string | null;
  } | null;
  description?: string;
  location?: string;
  state?: string;
  category?: string;
  work?: string;
  start_date?: string;
  expected_end_date?: string;
  status?: string;
  is_active: boolean;
  logo_url?: string;
  // Sub-project support
  parent_project_id?: string;
  is_beneficiary_project?: boolean;
  beneficiary_number?: number;
  // Budget data from database
  total_budget?: number;
  utilized_budget?: number;
  // Beneficiary stats from database
  total_beneficiaries?: number;
  direct_beneficiaries?: number;
  beneficiary_type?: string;
  beneficiary_name?: string;
  metadata?: Record<string, unknown>;
  indirect_beneficiaries?: number;
  male_beneficiaries?: number;
  female_beneficiaries?: number;
  children_beneficiaries?: number;
  // Impact metrics from database
  impact_metrics?: ImpactMetricEntry[];
  // Predefined impact metric columns
  meals_served?: number;
  pads_distributed?: number;
  trees_planted?: number;
  students_enrolled?: number;
  schools_renovated?: number;
  // UI display properties from database
  display_color?: string;
  display_icon?: string;
  // Utilization Certificate
  uc_link?: string;
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
      .select(PROJECT_SELECT_FIELDS)
      .eq('csr_partner_id', partnerId)
      .eq('is_active', true)
      .is('parent_project_id', null)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    const projects = normalizeTollRelation((data || []) as unknown as Project[]);
    return projects;
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
      .select(PROJECT_SELECT_FIELDS)
      .is('parent_project_id', null)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching all projects:', error);
      return [];
    }

    console.log('fetchAllProjects - Raw data from Supabase:', data);
    console.log('fetchAllProjects - Sample projects with budget:', data?.slice(0, 3).map(p => ({ name: p.name, total_budget: p.total_budget, status: p.status })));
    
    const projects = normalizeTollRelation((data || []) as unknown as Project[]);
    return projects;
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
          `id, name, project_code, csr_partner_id, toll_id, description, location, state, status, is_active, total_beneficiaries, direct_beneficiaries, indirect_beneficiaries, male_beneficiaries, female_beneficiaries, children_beneficiaries, beneficiary_type, beneficiary_name, metadata, impact_metrics, meals_served, pads_distributed, trees_planted, students_enrolled, schools_renovated,
          toll:csr_partner_tolls!projects_toll_id_fkey(id, toll_name, poc_name, city, state)`
        )
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    // Handle toll as array and extract first item if present
    if (data && data.toll && Array.isArray(data.toll)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any).toll = (data.toll as any[])[0] || null;
    }

    return data as unknown as Project;
  } catch (error) {
    console.error('Exception fetching project:', error);
    return null;
  }
};
