import { supabase } from './supabaseClient';

export interface DashboardMetric {
  id: string;
  project_id: string;
  title: string;
  current: number;
  target: number;
  type: 'beneficiaries' | 'events' | 'donations' | 'volunteers' | 'schools' | 'reach';
  details?: {
    male?: number;
    female?: number;
    children?: number;
    locations?: { name: string; count: number }[];
  };
  created_at?: string;
  updated_at?: string;
}

// Fetch all dashboard metrics (derived from projects table)
export const getAllDashboardMetrics = async (): Promise<DashboardMetric[]> => {
  try {
    const selectStr = 'id,name,total_beneficiaries,created_at,updated_at';
    const { data, error } = await supabase
      .from('projects')
      .select(selectStr)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform project data into dashboard metrics
    return (data || []).map((project: {id: string; name: string; total_beneficiaries: number; created_at?: string; updated_at?: string}) => ({
      id: project.id,
      project_id: project.id,
      title: project.name,
      current: project.total_beneficiaries || 0,
      target: project.total_beneficiaries || 0,
      type: 'beneficiaries' as const,
      created_at: project.created_at,
      updated_at: project.updated_at,
    }));
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};

// Fetch metrics by project ID
export const getMetricsByProjectId = async (projectId: string): Promise<DashboardMetric[]> => {
  try {
    const selectStr = 'id,name,total_beneficiaries,created_at,updated_at';
    const { data, error } = await supabase
      .from('projects')
      .select(selectStr)
      .eq('id', projectId)
      .single();

    if (error) throw error;
    
    if (!data) return [];
    
    const project = data as {id: string; name: string; total_beneficiaries: number; created_at?: string; updated_at?: string};
    return [{
      id: project.id,
      project_id: project.id,
      title: project.name,
      current: project.total_beneficiaries || 0,
      target: project.total_beneficiaries || 0,
      type: 'beneficiaries' as const,
      created_at: project.created_at,
      updated_at: project.updated_at,
    }];
  } catch (err) {
    console.error(`Error fetching metrics for project ${projectId}:`, err);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};

// Fetch metrics by partner (all projects under a partner)
export const getMetricsByPartner = async (partnerId: string): Promise<DashboardMetric[]> => {
  try {
    const selectStr = 'id,name,total_beneficiaries,created_at,updated_at';
    const { data, error } = await supabase
      .from('projects')
      .select(selectStr)
      .eq('csr_partner_id', partnerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((project: {id: string; name: string; total_beneficiaries: number; created_at?: string; updated_at?: string}) => ({
      id: project.id,
      project_id: project.id,
      title: project.name,
      current: project.total_beneficiaries || 0,
      target: project.total_beneficiaries || 0,
      type: 'beneficiaries' as const,
      created_at: project.created_at,
      updated_at: project.updated_at,
    }));
  } catch (err) {
    console.error(`Error fetching metrics for partner ${partnerId}:`, err);
    return [];
  }
};

// Create a new dashboard metric (disabled - project_metrics table doesn't exist)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createDashboardMetric = async (_metric: Omit<DashboardMetric, 'id' | 'created_at' | 'updated_at'>): Promise<DashboardMetric> => {
  throw new Error('Creating metrics is not yet implemented');
};

// Update a dashboard metric (disabled - project_metrics table doesn't exist)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateDashboardMetric = async (_id: string, _metric: Partial<DashboardMetric>): Promise<DashboardMetric> => {
  throw new Error('Updating metrics is not yet implemented');
};

// Delete a dashboard metric (disabled - project_metrics table doesn't exist)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteDashboardMetric = async (_id: string): Promise<boolean> => {
  throw new Error('Deleting metrics is not yet implemented');
};

// Get aggregated metrics for a list of projects (disabled - project_metrics table doesn't exist)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getAggregatedMetrics = async (_projectIds: string[]): Promise<Record<string, { current: number; target: number }>> => {
  try {
    // Return empty/zero aggregated data since project_metrics table doesn't exist
    const aggregated: Record<string, { current: number; target: number }> = {
      beneficiaries: { current: 0, target: 0 },
      events: { current: 0, target: 0 },
      donations: { current: 0, target: 0 },
      volunteers: { current: 0, target: 0 },
      schools: { current: 0, target: 0 },
      reach: { current: 0, target: 0 },
    };

    return aggregated;
  } catch (err) {
    console.error('Error fetching aggregated metrics:', err);
    return {};
  }
};
