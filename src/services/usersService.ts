import { supabase } from './supabaseClient';

export interface User {
  id: string;
  email: string;
  full_name: string;
  mobile_number?: string;
  address?: string;
  city?: string;
  state?: string;
  role: 'admin' | 'accountant' | 'project_manager' | 'team_member' | 'client';
  department?: string;
  team?: string;
  designation?: string;
  manager_id?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<string, number>;
  usersByDepartment: Record<string, number>;
}

export interface UserSearchResult {
  users: User[];
  total: number;
}

export interface UserActivityLog {
  user_id: string;
  switched_from: string;
  switched_to: string;
  switched_at: string;
}

/**
 * Get all active users for switching
 */
export const getAllActiveUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching active users:', err);
    throw err;
  }
};

/**
 * Get users by specific role
 */
export const getUsersByRole = async (role: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error fetching users by role ${role}:`, err);
    throw err;
  }
};

/**
 * Get users by department
 */
export const getUsersByDepartment = async (department: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('department', department)
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error fetching users by department ${department}:`, err);
    throw err;
  }
};

/**
 * Search users by name or email
 */
export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error searching users:', err);
    throw err;
  }
};

/**
 * Get user by ID with details
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') return null; // Not found
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching user:', err);
    throw err;
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (): Promise<UserStats> => {
  try {
    // Get all users with counts
    const { data: allUsers, error } = await supabase
      .from('users')
      .select('id, role, department, is_active');

    if (error) throw error;

    const users = (allUsers || []) as Array<{ id: string; role: string; department: string | null; is_active: boolean }>;

    // Calculate statistics
    const stats: UserStats = {
      totalUsers: users.length,
      activeUsers: users.filter((u: { is_active: boolean }) => u.is_active).length,
      inactiveUsers: users.filter((u: { is_active: boolean }) => !u.is_active).length,
      usersByRole: {},
      usersByDepartment: {},
    };

    // Count by role
    users.forEach((user: { role: string; department: string | null }) => {
      if (user.role) {
        stats.usersByRole[user.role] = (stats.usersByRole[user.role] || 0) + 1;
      }
      if (user.department) {
        stats.usersByDepartment[user.department] = (stats.usersByDepartment[user.department] || 0) + 1;
      }
    });

    return stats;
  } catch (err) {
    console.error('Error calculating user stats:', err);
    throw err;
  }
};

/**
 * Get users excluding current user
 */
export const getOtherUsers = async (currentUserId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .neq('id', currentUserId)
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching other users:', err);
    throw err;
  }
};

/**
 * Get recent user logins
 */
export const getRecentLogins = async (limit = 10): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .not('last_login_at', 'is', null)
      .order('last_login_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching recent logins:', err);
    throw err;
  }
};

/**
 * Update user's last login time
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
  } catch (err) {
    console.error('Error updating last login:', err);
    throw err;
  }
};

/**
 * Get distinct departments for filtering
 */
export const getAllDepartments = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('department')
      .not('department', 'is', null)
      .eq('is_active', true);

    if (error) throw error;

    const departments = data
      ? [...new Set(data.map((u: { department: string | null }) => u.department).filter(Boolean))].sort() as string[]
      : [];

    return departments;
  } catch (err) {
    console.error('Error fetching departments:', err);
    throw err;
  }
};

/**
 * Get distinct roles for filtering
 */
export const getAllRoles = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('is_active', true);

    if (error) throw error;

    const roles = data
      ? [...new Set(data.map((u: { role: string }) => u.role).filter(Boolean))].sort() as string[]
      : [];

    return roles;
  } catch (err) {
    console.error('Error fetching roles:', err);
    throw err;
  }
};

/**
 * Calculate time since last login
 */
export const getTimeSinceLogin = (lastLoginAt?: string): string => {
  if (!lastLoginAt) return 'Never logged in';

  const lastLogin = new Date(lastLoginAt);
  const now = new Date();
  const diffMs = now.getTime() - lastLogin.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return lastLogin.toLocaleDateString();
};

/**
 * Log user switch activity
 */
export const logUserSwitch = async (
  switchedByUserId: string,
  switchedToUserId: string,
  switchedFromRole: string
): Promise<void> => {
  try {
    const { error } = await supabase.from('activity_logs').insert([
      {
        user_id: switchedByUserId,
        action: 'LOGIN',
        action_type: 'view',
        entity_type: 'user_switch',
        entity_id: switchedToUserId,
        description: `Switched view from ${switchedFromRole} to ${switchedToUserId}`,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) console.warn('Could not log user switch:', error);
  } catch (err) {
    console.warn('Error logging user switch:', err);
    // Non-critical operation, don't throw
  }
};

/**
 * Format user display name
 */
export const formatUserName = (user: User): string => {
  return user.full_name || user.email;
};

/**
 * Format role for display
 */
export const formatRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    admin: 'Admin',
    accountant: 'Accountant',
    project_manager: 'Project Manager',
    'project-manager': 'Project Manager',
    team_member: 'Team Member',
    'team-member': 'Team Member',
    client: 'Client',
  };

  return roleMap[role] || role;
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user: User): string => {
  const name = user.full_name || user.email;
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Get all users (including inactive)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching all users:', err);
    throw err;
  }
};

/**
 * Create a new user
 */
export const createUser = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
};

/**
 * Update a user
 */
export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
};
