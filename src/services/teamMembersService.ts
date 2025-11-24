import { supabase } from './supabaseClient';

/**
 * TeamMembersService - Manages all database operations for team members
 * Handles CRUD operations, filtering, searching, and statistics
 */

// Team Member interface matching the users table schema
export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  mobile_number: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  role: string;
  department: string;
  team: string;
  designation: string;
  manager_id: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// Team Member with manager name
export interface TeamMemberWithManager extends TeamMember {
  manager_name?: string;
  status?: 'active' | 'on-leave' | 'inactive';
  joinedDate?: string;
}

// Team Member Statistics
export interface TeamMemberStats {
  total: number;
  active: number;
  onLeave: number;
  inactive: number;
  teams: number;
  departments: number;
  roleDistribution: Record<string, number>;
  departmentDistribution: Record<string, number>;
}

// Team Member Search Result
export interface TeamMemberSearchResult {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  city: string;
}

// Manager List for dropdown
export interface ManagerOption {
  id: string;
  full_name: string;
  designation: string;
}

class TeamMembersService {
  /**
   * Get all active team members
   */
  async getAllTeamMembers(): Promise<TeamMemberWithManager[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) throw error;

      // Enrich with manager names
      const membersWithManager = await Promise.all(
        (data || []).map(async (member: TeamMember) => {
          const managerName = await this.getManagerName(member.manager_id);
          return {
            ...member,
            manager_name: managerName,
            status: member.is_active ? 'active' : 'inactive',
            joinedDate: member.created_at?.split('T')[0] || '',
          };
        })
      );

      return membersWithManager as TeamMemberWithManager[];
    } catch (error) {
      console.error('Error fetching all team members:', error);
      return [];
    }
  }

  /**
   * Get team members by status
   */
  async getTeamMembersByStatus(isActive: boolean): Promise<TeamMemberWithManager[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', isActive)
        .order('full_name', { ascending: true });

      if (error) throw error;

      const membersWithManager = await Promise.all(
        (data || []).map(async (member: TeamMember) => {
          const managerName = await this.getManagerName(member.manager_id);
          return {
            ...member,
            manager_name: managerName,
            status: isActive ? 'active' : 'inactive',
            joinedDate: member.created_at?.split('T')[0] || '',
          };
        })
      );

      return membersWithManager as TeamMemberWithManager[];
    } catch (error) {
      console.error('Error fetching team members by status:', error);
      return [];
    }
  }

  /**
   * Get team members by department
   */
  async getTeamMembersByDepartment(department: string): Promise<TeamMemberWithManager[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('department', department)
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) throw error;

      const membersWithManager = (data || []).map((member: TeamMember) => ({
        ...member,
        status: 'active' as const,
        joinedDate: member.created_at?.split('T')[0] || '',
      }));

      return membersWithManager as TeamMemberWithManager[];
    } catch (error) {
      console.error('Error fetching team members by department:', error);
      return [];
    }
  }

  /**
   * Get team members by team
   */
  async getTeamMembersByTeam(team: string): Promise<TeamMemberWithManager[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('team', team)
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) throw error;

      const membersWithManager = (data || []).map((member: TeamMember) => ({
        ...member,
        status: 'active' as const,
        joinedDate: member.created_at?.split('T')[0] || '',
      }));

      return membersWithManager as TeamMemberWithManager[];
    } catch (error) {
      console.error('Error fetching team members by team:', error);
      return [];
    }
  }

  /**
   * Get team members by role
   */
  async getTeamMembersByRole(role: string): Promise<TeamMemberWithManager[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) throw error;

      const membersWithManager = (data || []).map((member: TeamMember) => ({
        ...member,
        status: 'active' as const,
        joinedDate: member.created_at?.split('T')[0] || '',
      }));

      return membersWithManager as TeamMemberWithManager[];
    } catch (error) {
      console.error('Error fetching team members by role:', error);
      return [];
    }
  }

  /**
   * Get team member by ID
   */
  async getTeamMemberById(memberId: string): Promise<TeamMemberWithManager | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const managerName = await this.getManagerName(data.manager_id);
      return {
        ...data,
        manager_name: managerName,
        status: data.is_active ? 'active' : 'inactive',
        joinedDate: data.created_at?.split('T')[0] || '',
      } as TeamMemberWithManager;
    } catch (error) {
      console.error('Error fetching team member by ID:', error);
      return null;
    }
  }

  /**
   * Search team members by name, email, or phone
   */
  async searchTeamMembers(query: string): Promise<TeamMemberSearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, department, city')
        .or(
          `full_name.ilike.%${query}%,email.ilike.%${query}%,mobile_number.ilike.%${query}%`
        )
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching team members:', error);
      return [];
    }
  }

  /**
   * Get team member statistics
   */
  async getTeamMemberStats(members: TeamMemberWithManager[]): Promise<TeamMemberStats> {
    try {
      const activeMembers = members.filter((m) => m.status === 'active');
      const inactiveMembers = members.filter((m) => m.status === 'inactive');
      
      // Get all teams and departments
      const teams = new Set(members.map((m) => m.team).filter(Boolean));
      const departments = new Set(members.map((m) => m.department).filter(Boolean));

      // Count by role
      const roleDistribution: Record<string, number> = {};
      members.forEach((member) => {
        roleDistribution[member.role] = (roleDistribution[member.role] || 0) + 1;
      });

      // Count by department
      const departmentDistribution: Record<string, number> = {};
      members.forEach((member) => {
        if (member.department) {
          departmentDistribution[member.department] = (departmentDistribution[member.department] || 0) + 1;
        }
      });

      return {
        total: members.length,
        active: activeMembers.length,
        onLeave: 0, // This would require additional status tracking field
        inactive: inactiveMembers.length,
        teams: teams.size,
        departments: departments.size,
        roleDistribution,
        departmentDistribution,
      };
    } catch (error) {
      console.error('Error calculating team member stats:', error);
      return {
        total: 0,
        active: 0,
        onLeave: 0,
        inactive: 0,
        teams: 0,
        departments: 0,
        roleDistribution: {},
        departmentDistribution: {},
      };
    }
  }

  /**
   * Get available managers for dropdown
   */
  async getAvailableManagers(): Promise<ManagerOption[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, designation')
        .in('role', ['admin', 'project_manager'])
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available managers:', error);
      return [];
    }
  }

  /**
   * Get all departments
   */
  async getAllDepartments(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('department')
        .not('department', 'is', null)
        .eq('is_active', true);

      if (error) throw error;

      const departments = [...new Set((data || []).map((u: Record<string, unknown>) => (u['department'] as string)).filter(Boolean))];
      return departments.sort();
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  /**
   * Get all teams
   */
  async getAllTeams(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('team')
        .not('team', 'is', null)
        .eq('is_active', true);

      if (error) throw error;

      const teams = [...new Set((data || []).map((u: Record<string, unknown>) => (u['team'] as string)).filter(Boolean))];
      return teams.sort();
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  }

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('is_active', true);

      if (error) throw error;

      const roles = [...new Set((data || []).map((u: Record<string, unknown>) => (u['role'] as string)).filter(Boolean))];
      return roles.sort();
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  /**
   * Create new team member
   */
  async createTeamMember(
    member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([member])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating team member:', error);
      return null;
    }
  }

  /**
   * Update team member
   */
  async updateTeamMember(
    memberId: string,
    updates: Partial<TeamMember>
  ): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating team member:', error);
      return null;
    }
  }

  /**
   * Deactivate team member
   */
  async deactivateTeamMember(memberId: string): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deactivating team member:', error);
      return null;
    }
  }

  /**
   * Activate team member
   */
  async activateTeamMember(memberId: string): Promise<TeamMember | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error activating team member:', error);
      return null;
    }
  }

  /**
   * Update last login
   */
  async updateLastLogin(memberId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', memberId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Get manager name by ID
   */
  private async getManagerName(managerId: string | null): Promise<string> {
    if (!managerId) return 'Unassigned';

    try {
      const { data } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', managerId)
        .single();

      return data?.full_name || 'Unassigned';
    } catch {
      return 'Unassigned';
    }
  }

  /**
   * Get members by manager
   */
  async getTeamMembersByManager(managerId: string): Promise<TeamMemberWithManager[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('manager_id', managerId)
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) throw error;

      const membersWithManager = (data || []).map((member: TeamMember) => ({
        ...member,
        status: 'active' as const,
        joinedDate: member.created_at?.split('T')[0] || '',
      }));

      return membersWithManager as TeamMemberWithManager[];
    } catch (error) {
      console.error('Error fetching team members by manager:', error);
      return [];
    }
  }
}

export const teamMembersService = new TeamMembersService();
