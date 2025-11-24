import { supabase } from './supabaseClient';

export interface DailyReport {
  id: string;
  report_code: string;
  project_id: string;
  user_id: string;
  date: string;
  work_summary: string;
  tasks_completed: number;
  tasks_pending: number;
  notes: string;
  submitted_at: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export const dailyReportService = {
  async getAllDailyReports(): Promise<DailyReport[]> {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching daily reports:', error);
      return [];
    }
  },

  async getDailyReportsByProject(projectId: string): Promise<DailyReport[]> {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching daily reports:', error);
      return [];
    }
  },

  async getDailyReportsByUser(userId: string): Promise<DailyReport[]> {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching daily reports:', error);
      return [];
    }
  },

  async createDailyReport(report: Omit<DailyReport, 'id' | 'created_at' | 'updated_at'>): Promise<DailyReport | null> {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .insert([report])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating daily report:', error);
      return null;
    }
  },

  async updateDailyReport(reportId: string, updates: Partial<DailyReport>): Promise<DailyReport | null> {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating daily report:', error);
      return null;
    }
  },
};
