import { supabase } from './supabaseClient';

/**
 * Tasks Service
 * Provides CRUD operations for managing project tasks
 * Data source: tasks table
 */

export interface Task {
  id: string;
  task_code: string;
  project_id: string;
  timeline_id?: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  task_type?: 'Development' | 'Research' | 'Meeting' | 'Review' | 'Distribution' | 'Event' | 'Infrastructure' | 'Education' | 'Logistics' | 'Finance';
  category?: string;
  assigned_to: string;
  assigned_by?: string;
  department?: string;
  due_date: string;
  start_date?: string;
  completed_date?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_priority' | 'blocked' | 'cancelled';
  priority?: string;
  completion_percentage?: number;
  actual_hours?: number;
  tags?: string[];
  dependencies?: string[];
  is_visible_to_client?: boolean;
  is_from_client_timeline?: boolean;
  is_active?: boolean;
  checklist?: Record<string, unknown>;
  attachments?: Record<string, unknown>;
  comments_count?: number;
  updates_count?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface TaskStats {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  onPriority: number;
  blocked: number;
  cancelled: number;
  overdue: number;
}

// Get all tasks with optional filtering
export const getAllTasks = async (
  status?: string,
  projectId?: string
): Promise<Task[]> => {
  try {
    let query = supabase
      .from('tasks')
      .select(
        'id, task_code, project_id, timeline_id, parent_task_id, title, description, task_type, category, assigned_to, assigned_by, department, due_date, start_date, completed_date, status, priority, completion_percentage, actual_hours, tags, dependencies, is_visible_to_client, is_from_client_timeline, is_active, checklist, attachments, comments_count, updates_count, notes, metadata, created_at, updated_at, created_by, updated_by'
      );

    if (status) {
      query = query.eq('status', status);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching tasks:', err);
    throw err;
  }
};

// Get task by ID
export const getTaskById = async (id: string): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (err) {
    console.error('Error fetching task:', err);
    throw err;
  }
};

// Get tasks by project
export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching project tasks:', err);
    throw err;
  }
};

// Get tasks assigned to a user
export const getTasksByUser = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching user tasks:', err);
    throw err;
  }
};

// Get tasks by due date range
export const getTasksByDateRange = async (
  startDate: string,
  endDate: string
): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching tasks by date range:', err);
    throw err;
  }
};

// Get overdue tasks
export const getOverdueTasks = async (): Promise<Task[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .lt('due_date', today)
      .neq('status', 'completed')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching overdue tasks:', err);
    throw err;
  }
};

// Create a new task
export const createTask = async (
  taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating task:', err);
    throw err;
  }
};

// Update a task
export const updateTask = async (
  id: string,
  taskData: Partial<Task>
): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...taskData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating task:', err);
    throw err;
  }
};

// Update task status
export const updateTaskStatus = async (
  id: string,
  status: 'not_started' | 'in_progress' | 'completed' | 'on_priority' | 'blocked' | 'cancelled'
): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status,
        completed_date: status === 'completed' ? new Date().toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating task status:', err);
    throw err;
  }
};

// Update task completion percentage
export const updateTaskCompletion = async (
  id: string,
  completionPercentage: number
): Promise<Task> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        completion_percentage: completionPercentage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating task completion:', err);
    throw err;
  }
};

// Delete a task
export const deleteTask = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting task:', err);
    throw err;
  }
};

// Get task statistics
export const getTaskStats = async (): Promise<TaskStats> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('status, due_date');

    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];
    const stats: TaskStats = {
      total: data?.length || 0,
      notStarted: data?.filter((t) => t.status === 'not_started').length || 0,
      inProgress: data?.filter((t) => t.status === 'in_progress').length || 0,
      completed: data?.filter((t) => t.status === 'completed').length || 0,
      onPriority: data?.filter((t) => t.status === 'on_priority').length || 0,
      blocked: data?.filter((t) => t.status === 'blocked').length || 0,
      cancelled: data?.filter((t) => t.status === 'cancelled').length || 0,
      overdue: data?.filter((t) => t.due_date < today && t.status !== 'completed').length || 0,
    };

    return stats;
  } catch (err) {
    console.error('Error fetching task stats:', err);
    throw err;
  }
};

// Get upcoming tasks (due in next N days)
export const getUpcomingTasks = async (days: number = 7): Promise<Task[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('due_date', today)
      .lte('due_date', futureDate)
      .neq('status', 'completed')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching upcoming tasks:', err);
    throw err;
  }
};

// Get tasks by status
export const getTasksByStatus = async (
  status: 'not_started' | 'in_progress' | 'completed' | 'on_priority' | 'blocked' | 'cancelled'
): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', status)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching tasks by status:', err);
    throw err;
  }
};
