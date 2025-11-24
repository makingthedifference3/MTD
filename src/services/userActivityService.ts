import { supabase } from './supabaseClient';

export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  timestamp: string;
  created_at: string;
}

export interface UserGrowthMetric {
  id: string;
  date: string;
  total_users: number;
  active_users: number;
  new_users_count: number;
  created_at: string;
}

// Get user growth data for the past N days
export const getUserGrowthMetrics = async (days: number = 30): Promise<UserGrowthMetric[]> => {
  try {
    const { data, error } = await supabase
      .from('user_growth_metrics')
      .select('*')
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching user growth metrics:', err);
    return [];
  }
};

// Get user activity logs
export const getUserActivityLogs = async (limit: number = 100): Promise<UserActivityLog[]> => {
  try {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching user activity logs:', err);
    return [];
  }
};

// Get activity logs for specific user
export const getUserActivityByUser = async (userId: string, limit: number = 50): Promise<UserActivityLog[]> => {
  try {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching user activity:', err);
    return [];
  }
};

// Log user activity
export const logUserActivity = async (activity: Omit<UserActivityLog, 'id' | 'created_at'>): Promise<UserActivityLog | null> => {
  try {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .insert([activity])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error logging user activity:', err);
    return null;
  }
};

// Get user count by date (for growth chart)
export const getUserCountByDate = async (days: number = 30): Promise<Array<{ date: string; count: number }>> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // Group by date
    const grouped: Record<string, number> = {};
    data?.forEach((user) => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  } catch (err) {
    console.error('Error fetching user count by date:', err);
    return [];
  }
};
