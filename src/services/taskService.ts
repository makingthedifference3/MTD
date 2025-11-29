import { supabase } from './supabaseClient';

export interface Task {
  id: string;
  task_code: string;
  project_id: string;
  toll_id?: string;
  title: string;
  description?: string;
  assigned_to: string;
  assigned_by?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_priority' | 'blocked' | 'cancelled';
  priority: string;
  due_date: string;
  start_date?: string;
  completed_date?: string;
  completion_percentage: number;
  department?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskWithProject extends Task {
  project_name?: string;
  project_code?: string;
}

export interface TaskStats {
  totalTasks?: number;
  total?: number;
  inProgress?: number;
  completed?: number;
  pending?: number;
  notStarted?: number;
  highPriority?: number;
  overdue?: number;
  completionRate?: number;
  byPriority?: Record<string, number>;
  byStatus?: Record<string, number>;
}

/**
 * Get all tasks
 */
export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

/**
 * Get tasks assigned to a specific user
 */
export const getTasksForUser = async (userId: string): Promise<TaskWithProject[]> => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .eq('is_active', true)
      .order('due_date', { ascending: true });

    if (error) throw error;

    if (!tasks || tasks.length === 0) return [];

    // Enrich with project names
    const enrichedTasks = await Promise.all(
      tasks.map(async (task: Task) => {
        const projectName = await getProjectName(task.project_id);
        return {
          ...task,
          project_name: projectName,
        };
      })
    );

    return enrichedTasks;
  } catch (err) {
    console.error('Error fetching user tasks:', err);
    return [];
  }
};

/**
 * Get tasks for a specific project
 */
export const getTasksByProject = async (projectId: string): Promise<TaskWithProject[]> => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return tasks || [];
  } catch (err) {
    console.error(`Error fetching tasks for project ${projectId}:`, err);
    return [];
  }
};

/**
 * Get tasks by status
 */
export const getTasksByStatus = async (userId: string, status: string): Promise<TaskWithProject[]> => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .eq('status', status)
      .eq('is_active', true)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return tasks || [];
  } catch (err) {
    console.error(`Error fetching tasks with status ${status}:`, err);
    return [];
  }
};

/**
 * Get task statistics for a user
 */
export const getTaskStats = async (userId: string): Promise<TaskStats> => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status, priority, due_date, completion_percentage')
      .eq('assigned_to', userId)
      .eq('is_active', true);

    if (error) throw error;

    const taskList = (tasks as Array<{status: string; priority: string; due_date: string; completion_percentage: number}>) || [];
    const today = new Date();

    const stats: TaskStats = {
      totalTasks: taskList.length,
      inProgress: taskList.filter((t) => t.status === 'in_progress').length,
      completed: taskList.filter((t) => t.status === 'completed').length,
      pending: taskList.filter((t) => t.status === 'not_started').length,
      highPriority: taskList.filter((t) => t.priority === 'on_priority' || t.priority === 'high').length,
      overdue: taskList.filter((t) => new Date(t.due_date) < today && t.status !== 'completed').length,
      completionRate: taskList.length > 0
        ? Math.round((taskList.filter((t) => t.status === 'completed').length / taskList.length) * 100)
        : 0,
    };

    return stats;
  } catch (err) {
    console.error('Error calculating task stats:', err);
    return {
      totalTasks: 0,
      inProgress: 0,
      completed: 0,
      pending: 0,
      highPriority: 0,
      overdue: 0,
      completionRate: 0,
    };
  }
};

/**
 * Get high priority tasks for a user
 */
export const getHighPriorityTasks = async (userId: string, limit = 5): Promise<TaskWithProject[]> => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .in('priority', ['on_priority', 'high', 'On Priority'])
      .eq('is_active', true)
      .neq('status', 'completed')
      .order('due_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return tasks || [];
  } catch (err) {
    console.error('Error fetching high priority tasks:', err);
    return [];
  }
};

/**
 * Get overdue tasks for a user
 */
export const getOverdueTasks = async (userId: string): Promise<TaskWithProject[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .lt('due_date', today)
      .neq('status', 'completed')
      .eq('is_active', true)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return tasks || [];
  } catch (err) {
    console.error('Error fetching overdue tasks:', err);
    return [];
  }
};

/**
 * Get task by ID
 */
export const getTaskById = async (taskId: string): Promise<TaskWithProject | null> => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;

    if (task) {
      const projectName = await getProjectName(task.project_id);
      return { ...task, project_name: projectName };
    }

    return null;
  } catch (err) {
    console.error('Error fetching task:', err);
    return null;
  }
};

/**
 * Update task status
 */
export const updateTaskStatus = async (taskId: string, status: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) throw error;
  } catch (err) {
    console.error('Error updating task status:', err);
    throw err;
  }
};

/**
 * Update task completion percentage
 */
export const updateTaskProgress = async (taskId: string, completionPercentage: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({
        completion_percentage: completionPercentage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) throw error;
  } catch (err) {
    console.error('Error updating task progress:', err);
    throw err;
  }
};

/**
 * Complete a task
 */
export const completeTask = async (taskId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completion_percentage: 100,
        completed_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) throw error;
  } catch (err) {
    console.error('Error completing task:', err);
    throw err;
  }
};

/**
 * Get project name by ID
 */
export const getProjectName = async (projectId: string): Promise<string> => {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('name, project_code')
      .eq('id', projectId)
      .single();

    if (error && error.code === 'PGRST116') return 'Unknown Project';
    if (error) throw error;

    return project?.name || 'Unknown Project';
  } catch (err) {
    console.error('Error fetching project name:', err);
    return 'Unknown Project';
  }
};

/**
 * Format status for display
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    completed: 'Completed',
    on_priority: 'On Priority',
    blocked: 'Blocked',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
};

/**
 * Format priority for display
 */
export const formatPriority = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    high: 'High',
    on_priority: 'High',
    'On Priority': 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return priorityMap[priority] || priority;
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'on_priority':
    case 'on priority':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    case 'low':
      return 'bg-emerald-100 text-emerald-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-700';
    case 'in_progress':
    case 'in progress':
      return 'bg-amber-100 text-amber-700';
    case 'not_started':
    case 'not started':
      return 'bg-red-100 text-red-700';
    case 'on_priority':
    case 'on priority':
      return 'bg-purple-100 text-purple-700';
    case 'blocked':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Calculate days until due date
 */
export const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
};

/**
 * Format due date display
 */
export const formatDueDate = (dueDate: string): string => {
  const days = getDaysUntilDue(dueDate);

  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  } else if (days === 0) {
    return 'Due today';
  } else if (days === 1) {
    return 'Due tomorrow';
  } else if (days <= 7) {
    return `Due in ${days} days`;
  } else {
    return new Date(dueDate).toLocaleDateString();
  }
};

/**
 * Create task
 */
export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
};

/**
 * Update task
 */
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
};

/**
 * Delete task
 */
export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

/**
 * Get all departments
 */
export const getAllDepartments = async (): Promise<string[]> => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('department')
      .eq('is_active', true)
      .not('department', 'is', null);

    if (error) throw error;

    const departments = new Set<string>();
    tasks?.forEach((task: {department?: string}) => {
      if (task.department) {
        departments.add(task.department);
      }
    });

    return Array.from(departments).sort();
  } catch (err) {
    console.error('Error fetching departments:', err);
    return [];
  }
};

/**
 * Search tasks by title or description
 */
export const searchTasks = async (query: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error searching tasks:', err);
    return [];
  }
};

/**
 * Get tasks by priority
 */
export const getTasksByPriority = async (priority: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('priority', priority)
      .eq('is_active', true)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error fetching tasks with priority ${priority}:`, err);
    return [];
  }
};

/**
 * Get tasks by department
 */
export const getTasksByDepartment = async (department: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('department', department)
      .eq('is_active', true)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error fetching tasks for department ${department}:`, err);
    return [];
  }
};

/**
 * Get upcoming tasks (due within next 7 days)
 */
export const getUpcomingTasks = async (): Promise<Task[]> => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', nextWeek.toISOString().split('T')[0])
      .neq('status', 'completed')
      .eq('is_active', true)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching upcoming tasks:', err);
    return [];
  }
};

/**
 * Assign task to user
 */
export const assignTask = async (taskId: string, userId: string): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        assigned_to: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error assigning task:', error);
    return null;
  }
};
