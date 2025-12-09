import { supabase } from './supabaseClient';

// =====================================================
// TYPES
// =====================================================

export interface ProjectActivity {
  id: string;
  activity_code: string;
  project_id: string;
  csr_partner_id: string;
  toll_id?: string;
  title: string;
  description?: string;
  section: string;
  section_order: number;
  activity_order: number;
  start_date?: string;
  end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  completion_percentage: number;
  assigned_to?: string;
  responsible_person?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  remarks?: string;
  blockers?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProjectActivityItem {
  id: string;
  activity_id: string;
  item_text: string;
  item_order: number;
  is_completed: boolean;
  completed_at?: string;
  completed_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectActivityWithDetails extends ProjectActivity {
  project_name?: string;
  project_code?: string;
  csr_partner_name?: string;
  toll_name?: string;
  assigned_to_name?: string;
  items?: ProjectActivityItem[];
}

export interface ActivityStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  onHold: number;
  overallCompletion: number;
}

// =====================================================
// ACTIVITY CRUD OPERATIONS
// =====================================================

/**
 * Get all activities for a project with details
 */
export const getActivitiesByProject = async (
  projectId: string
): Promise<ProjectActivityWithDetails[]> => {
  try {
    const { data, error } = await supabase
      .from('project_activities')
      .select(`
        *,
        projects:project_id (name, project_code),
        csr_partners:csr_partner_id (name),
        csr_partner_tolls:toll_id (toll_name, poc_name),
        users:assigned_to (full_name)
      `)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get items for each activity
    const activitiesWithItems = await Promise.all(
      (data || []).map(async (activity) => {
        const items = await getActivityItems(activity.id);
        return {
          ...activity,
          project_name: activity.projects?.name,
          project_code: activity.projects?.project_code,
          csr_partner_name: activity.csr_partners?.name,
          toll_name: activity.csr_partner_tolls?.toll_name || activity.csr_partner_tolls?.poc_name,
          assigned_to_name: activity.users?.full_name,
          items,
        };
      })
    );

    return activitiesWithItems;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};

/**
 * Get activities by partner (optionally filtered by toll)
 */
export const getActivitiesByPartner = async (
  partnerId: string,
  tollId?: string
): Promise<ProjectActivityWithDetails[]> => {
  try {
    let query = supabase
      .from('project_activities')
      .select(`
        *,
        projects:project_id (name, project_code),
        csr_partners:csr_partner_id (name),
        csr_partner_tolls:toll_id (toll_name, poc_name),
        users:assigned_to (full_name)
      `)
      .eq('csr_partner_id', partnerId)
      .eq('is_active', true)
      .order('section_order', { ascending: true })
      .order('activity_order', { ascending: true });

    if (tollId) {
      query = query.eq('toll_id', tollId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get items for each activity
    const activitiesWithItems = await Promise.all(
      (data || []).map(async (activity) => {
        const items = await getActivityItems(activity.id);
        return {
          ...activity,
          project_name: activity.projects?.name,
          project_code: activity.projects?.project_code,
          csr_partner_name: activity.csr_partners?.name,
          toll_name: activity.csr_partner_tolls?.toll_name || activity.csr_partner_tolls?.poc_name,
          assigned_to_name: activity.users?.full_name,
          items,
        };
      })
    );

    return activitiesWithItems;
  } catch (error) {
    console.error('Error fetching activities by partner:', error);
    return [];
  }
};

/**
 * Get all activities
 */
export const getAllActivities = async (): Promise<ProjectActivityWithDetails[]> => {
  try {
    const { data, error } = await supabase
      .from('project_activities')
      .select(`
        *,
        projects:project_id (name, project_code),
        csr_partners:csr_partner_id (name),
        csr_partner_tolls:toll_id (toll_name, poc_name),
        users:assigned_to (full_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((activity) => ({
      ...activity,
      project_name: activity.projects?.name,
      project_code: activity.projects?.project_code,
      csr_partner_name: activity.csr_partners?.name,
      toll_name: activity.csr_partner_tolls?.toll_name || activity.csr_partner_tolls?.poc_name,
      assigned_to_name: activity.users?.full_name,
    }));
  } catch (error) {
    console.error('Error fetching all activities:', error);
    return [];
  }
};

/**
 * Create a new activity
 */
export const createActivity = async (
  activity: Omit<ProjectActivity, 'id' | 'activity_code' | 'created_at' | 'updated_at'>
): Promise<ProjectActivity | null> => {
  try {
    const { data, error } = await supabase
      .from('project_activities')
      .insert([{
        ...activity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating activity:', error);
    return null;
  }
};

/**
 * Update an activity
 */
export const updateActivity = async (
  id: string,
  updates: Partial<ProjectActivity>
): Promise<ProjectActivity | null> => {
  try {
    const { data, error } = await supabase
      .from('project_activities')
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
    console.error('Error updating activity:', error);
    return null;
  }
};

/**
 * Delete an activity (soft delete)
 */
export const deleteActivity = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('project_activities')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting activity:', error);
    return false;
  }
};

/**
 * Hard delete an activity
 */
export const hardDeleteActivity = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('project_activities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error hard deleting activity:', error);
    return false;
  }
};

// =====================================================
// ACTIVITY ITEMS CRUD OPERATIONS
// =====================================================

/**
 * Get items for an activity
 */
export const getActivityItems = async (activityId: string): Promise<ProjectActivityItem[]> => {
  try {
    const { data, error } = await supabase
      .from('project_activity_items')
      .select('*')
      .eq('activity_id', activityId)
      .order('item_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching activity items:', error);
    return [];
  }
};

/**
 * Create a new activity item
 */
export const createActivityItem = async (
  item: Omit<ProjectActivityItem, 'id' | 'created_at' | 'updated_at'>
): Promise<ProjectActivityItem | null> => {
  try {
    const { data, error } = await supabase
      .from('project_activity_items')
      .insert([{
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating activity item:', error);
    return null;
  }
};

/**
 * Create multiple activity items
 */
export const createActivityItems = async (
  items: Omit<ProjectActivityItem, 'id' | 'created_at' | 'updated_at'>[]
): Promise<ProjectActivityItem[]> => {
  try {
    const now = new Date().toISOString();
    const itemsWithTimestamps = items.map((item) => ({
      ...item,
      created_at: now,
      updated_at: now,
    }));

    const { data, error } = await supabase
      .from('project_activity_items')
      .insert(itemsWithTimestamps)
      .select();

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error creating activity items:', error);
    return [];
  }
};

/**
 * Update an activity item
 */
export const updateActivityItem = async (
  id: string,
  updates: Partial<ProjectActivityItem>
): Promise<ProjectActivityItem | null> => {
  try {
    const { data, error } = await supabase
      .from('project_activity_items')
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
    console.error('Error updating activity item:', error);
    return null;
  }
};

/**
 * Toggle item completion
 */
export const toggleItemCompletion = async (
  id: string,
  isCompleted: boolean,
  userId?: string
): Promise<ProjectActivityItem | null> => {
  try {
    const { data, error } = await supabase
      .from('project_activity_items')
      .update({
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        completed_by: isCompleted ? userId : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling item completion:', error);
    return null;
  }
};

/**
 * Delete an activity item
 */
export const deleteActivityItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('project_activity_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting activity item:', error);
    return false;
  }
};

// =====================================================
// STATISTICS
// =====================================================

/**
 * Get activity stats for a project
 */
export const getActivityStats = async (projectId?: string): Promise<ActivityStats> => {
  try {
    let query = supabase
      .from('project_activities')
      .select('status, completion_percentage')
      .eq('is_active', true);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const activities = data || [];
    const total = activities.length;
    const completed = activities.filter((a) => a.status === 'completed').length;
    const inProgress = activities.filter((a) => a.status === 'in_progress').length;
    const notStarted = activities.filter((a) => a.status === 'not_started').length;
    const onHold = activities.filter((a) => a.status === 'on_hold').length;
    const overallCompletion = total > 0
      ? Math.round(activities.reduce((sum, a) => sum + (a.completion_percentage || 0), 0) / total)
      : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      onHold,
      overallCompletion,
    };
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      onHold: 0,
      overallCompletion: 0,
    };
  }
};

/**
 * Get stats for partner's activities
 */
export const getPartnerActivityStats = async (
  partnerId: string,
  tollId?: string
): Promise<ActivityStats> => {
  try {
    let query = supabase
      .from('project_activities')
      .select('status, completion_percentage')
      .eq('csr_partner_id', partnerId)
      .eq('is_active', true);

    if (tollId) {
      query = query.eq('toll_id', tollId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const activities = data || [];
    const total = activities.length;
    const completed = activities.filter((a) => a.status === 'completed').length;
    const inProgress = activities.filter((a) => a.status === 'in_progress').length;
    const notStarted = activities.filter((a) => a.status === 'not_started').length;
    const onHold = activities.filter((a) => a.status === 'on_hold').length;
    const overallCompletion = total > 0
      ? Math.round(activities.reduce((sum, a) => sum + (a.completion_percentage || 0), 0) / total)
      : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      onHold,
      overallCompletion,
    };
  } catch (error) {
    console.error('Error fetching partner activity stats:', error);
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      onHold: 0,
      overallCompletion: 0,
    };
  }
};

// =====================================================
// SECTIONS
// =====================================================

/**
 * Get unique sections for a project
 */
export const getProjectSections = async (projectId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('project_activities')
      .select('section')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('section_order', { ascending: true });

    if (error) throw error;

    // Get unique sections
    const sections = [...new Set((data || []).map((d) => d.section))];
    return sections;
  } catch (error) {
    console.error('Error fetching project sections:', error);
    return [];
  }
};

/**
 * Common section presets
 */
export const SECTION_PRESETS = [
  'Planning',
  'Preparation',
  'Execution',
  'Monitoring',
  'Documentation',
  'Review',
  'Closure',
];

/**
 * Status configuration
 */
export const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  in_progress: { label: 'In Progress', color: 'amber', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  completed: { label: 'Completed', color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
  on_hold: { label: 'On Hold', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
  cancelled: { label: 'Cancelled', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
};

/**
 * Priority configuration
 */
export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'slate', bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
  medium: { label: 'Medium', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  high: { label: 'High', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
  critical: { label: 'Critical', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
};
