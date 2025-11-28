import { supabase } from './supabaseClient';
import { hashPassword } from '../utils/passwordUtils';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'accountant' | 'project_manager' | 'team_member' | 'client';
  is_active: boolean;
}

/**
 * Authenticate user with username and password
 * Returns user data if successful, null if failed
 */
export const authenticateUser = async (
  username: string,
  plainPassword: string
): Promise<AuthUser | null> => {
  try {
    const normalizedInput = username.trim();
    const safeInput = normalizedInput.replace(/"/g, '\\"');
    const orClause = `username.eq."${safeInput}",email.eq."${safeInput}"`;
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, role, is_active, password')
      .or(orClause)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('User not found:', error);
      return null;
    }

    // Verify password by comparing stored plaintext value
    if (plainPassword !== data.password) {
      console.error('Password mismatch for user:', username);
      return null;
    }

    // Update last login time
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.id);

    // Return user without password field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = data;
    return userWithoutPassword as AuthUser;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<AuthUser | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, role, is_active')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data as AuthUser;
  } catch (error) {
    console.error('Exception fetching user:', error);
    return null;
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<AuthUser[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, role, is_active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data as AuthUser[];
  } catch (error) {
    console.error('Exception fetching users:', error);
    return [];
  }
};

/**
 * Create new user (admin only)
 */
export const createUser = async (userData: {
  username: string;
  password: string;
  email: string;
  full_name: string;
  role: string;
  is_active?: boolean;
}): Promise<AuthUser | null> => {
  try {
    // Hash password automatically
    const hashedPassword = await hashPassword(userData.password);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: userData.username,
          password: hashedPassword,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          is_active: userData.is_active ?? true,
        },
      ])
      .select('id, username, email, full_name, role, is_active')
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data as AuthUser;
  } catch (error) {
    console.error('Exception creating user:', error);
    return null;
  }
};

/**
 * Update user
 */
export const updateUser = async (
  userId: string,
  userData: Partial<{
    username?: string;
    email?: string;
    full_name?: string;
    role?: string;
    is_active?: boolean;
    password?: string;
  }>
): Promise<AuthUser | null> => {
  try {
    const updateData = { ...userData };

    // Hash password if being updated
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, username, email, full_name, role, is_active')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data as AuthUser;
  } catch (error) {
    console.error('Exception updating user:', error);
    return null;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting user:', error);
    return false;
  }
};
