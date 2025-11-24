import { supabase } from './supabaseClient';

export interface Report {
  id: string;
  report_code: string;
  project_id: string;
  title: string;
  report_type: 'Project' | 'Daily' | 'Monthly' | 'Quarterly' | 'Annual' | 'Impact';
  description: string;
  status: 'draft' | 'submitted' | 'approved';
  generated_date: string;
  created_at: string;
  updated_at: string;
}

export const reportService = {
  async getAllReports(): Promise<Report[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  async getReportsByProject(projectId: string): Promise<Report[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  async createReport(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Promise<Report | null> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([report])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      return null;
    }
  },

  async updateReport(reportId: string, updates: Partial<Report>): Promise<Report | null> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating report:', error);
      return null;
    }
  },
};
