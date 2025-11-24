import { supabase } from './supabaseClient';

export interface DailyReport {
  id: string;
  report_code: string;
  project_id: string;
  user_id: string;
  date: string;
  day_of_week: string;
  work_summary: string;
  activities: string[];
  locations_visited: string[];
  tasks_completed: number;
  tasks_pending: number;
  tasks_started: number;
  task_details: Record<string, string | number | boolean>;
  start_time: string;
  end_time: string;
  photos: Record<string, string | number>;
  videos: Record<string, string | number>;
  documents: Record<string, string | number>;
  notes: string;
  submitted_at: string;
  approved_by: string;
  approved_at: string;
  created_at: string;
  updated_at: string;
}

export interface DailyReportDisplay {
  id: string;
  taskName: string;
  dueDate: string;
  completionStatus: 'not_started' | 'in_progress' | 'completed' | 'on_priority' | 'blocked' | 'cancelled';
  assignedBy: string;
  projectId: string;
  userName: string;
}

export interface DailyReportStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  blockedTasks: number;
}

/**
 * Get all daily reports
 */
export const getAllDailyReports = async (): Promise<DailyReport[]> => {
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
};

/**
 * Get daily report by ID
 */
export const getDailyReportById = async (id: string): Promise<DailyReport | null> => {
  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching daily report:', error);
    return null;
  }
};

/**
 * Get daily reports by date range
 */
export const getDailyReportsByDateRange = async (startDate: string, endDate: string): Promise<DailyReport[]> => {
  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching daily reports by date range:', error);
    return [];
  }
};

/**
 * Get daily reports by project
 */
export const getDailyReportsByProject = async (projectId: string): Promise<DailyReport[]> => {
  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching daily reports by project:', error);
    return [];
  }
};

/**
 * Get daily reports by user
 */
export const getDailyReportsByUser = async (userId: string): Promise<DailyReport[]> => {
  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching daily reports by user:', error);
    return [];
  }
};

/**
 * Create new daily report
 */
export const createDailyReport = async (
  data: Omit<DailyReport, 'id' | 'created_at' | 'updated_at'>
): Promise<DailyReport | null> => {
  try {
    const { data: result, error } = await supabase
      .from('daily_reports')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating daily report:', error);
    return null;
  }
};

/**
 * Update daily report
 */
export const updateDailyReport = async (id: string, updates: Partial<DailyReport>): Promise<DailyReport | null> => {
  try {
    const { data, error } = await supabase
      .from('daily_reports')
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
    console.error('Error updating daily report:', error);
    return null;
  }
};

/**
 * Delete daily report
 */
export const deleteDailyReport = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('daily_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting daily report:', error);
    return false;
  }
};

interface ReportWithUser {
  id: string;
  date: string;
  project_id: string;
  user_id: string;
  work_summary: string;
  users: Array<{ full_name: string }>;
  projects: Array<{ id: string }>;
}

/**
 * Get daily reports with task details from tasks table
 */
export const getDailyReportsWithTaskDetails = async (dateRange?: { start: string; end: string }): Promise<DailyReportDisplay[]> => {
  try {
    let query = supabase
      .from('daily_reports')
      .select(
        `
        id,
        date,
        project_id,
        user_id,
        work_summary,
        users:user_id(full_name),
        projects:project_id(id)
      `
      )
      .order('date', { ascending: false });

    if (dateRange) {
      query = query
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Join with tasks to get task details
    const reportsWithTasks = ((data as unknown as ReportWithUser[]) || []).map((report) => ({
      id: report.id as string,
      taskName: report.work_summary || 'Task',
      dueDate: report.date as string,
      completionStatus: 'in_progress' as const,
      assignedBy: 'System',
      projectId: report.project_id as string,
      userName: report.users?.[0]?.full_name || 'Unknown User',
    }));

    return reportsWithTasks;
  } catch (error) {
    console.error('Error fetching daily reports with task details:', error);
    return [];
  }
};

/**
 * Get daily report statistics
 */
export const getDailyReportStats = async (dateRange?: { start: string; end: string }): Promise<DailyReportStats> => {
  try {
    let query = supabase.from('daily_reports').select('*');

    if (dateRange) {
      query = query
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);
    }

    const { error } = await query;

    if (error) throw error;

    // Calculate stats by looking at tasks table related to these reports
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('status');

    if (tasksError) throw tasksError;

    const tasks = (tasksData || []) as Array<{ status: string }>;

    const stats: DailyReportStats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'completed').length,
      inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
      notStartedTasks: tasks.filter((t) => t.status === 'not_started').length,
      blockedTasks: tasks.filter((t) => t.status === 'blocked').length,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching daily report stats:', error);
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      notStartedTasks: 0,
      blockedTasks: 0,
    };
  }
};

/**
 * Approve daily report
 */
export const approveDailyReport = async (id: string, approvedBy: string): Promise<DailyReport | null> => {
  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .update({
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error approving daily report:', error);
    return null;
  }
};

/**
 * Submit daily report
 */
export const submitDailyReport = async (id: string): Promise<DailyReport | null> => {
  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .update({
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error submitting daily report:', error);
    return null;
  }
};

/**
 * Export daily reports to array (for CSV/PDF export)
 */
export const exportDailyReports = async (dateRange: { start: string; end: string }): Promise<DailyReportDisplay[]> => {
  try {
    const reports = await getDailyReportsWithTaskDetails(dateRange);
    return reports;
  } catch (error) {
    console.error('Error exporting daily reports:', error);
    return [];
  }
};

/**
 * Get pending approval reports
 */
export const getPendingApprovalReports = async (): Promise<DailyReport[]> => {
  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .is('approved_by', null)
      .is('approved_at', null)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending approval reports:', error);
    return [];
  }
};
