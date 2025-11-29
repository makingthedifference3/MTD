import { supabase } from './supabaseClient';
import type { ImpactMetricEntry } from '../utils/impactMetrics';

/**
 * ProjectsService - Manages all database operations for projects
 * Handles CRUD operations, filtering, searching, and statistics
 */

// Project interface matching the database schema
export interface Project {
  id: string;
  project_code: string;
  name: string;
  description?: string;
  csr_partner_id: string;
  toll_id?: string;
  project_manager_id?: string;
  assistant_manager_id?: string;
  location?: string;
  state?: string;
  district?: string;
  city?: string;
  block?: string;
  village?: string;
  pincode?: string;
  category?: string;
  work?: string;
  sub_category?: string;
  project_type?: 'one_time' | 'ongoing' | 'recurring';
  focus_area?: string[];
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
  start_date?: string;
  expected_end_date?: string;
  actual_end_date?: string;
  duration_months?: number;
  total_budget?: number;
  approved_budget?: number;
  utilized_budget?: number;
  pending_budget?: number;
  total_beneficiaries?: number;
  direct_beneficiaries?: number;
  indirect_beneficiaries?: number;
  beneficiary_type?: string;
  beneficiary_name?: string;
  // Sub-project support
  parent_project_id?: string;
  is_beneficiary_project?: boolean;
  beneficiary_number?: number;
  // Impact metrics
  impact_metrics?: ImpactMetricEntry[];
  male_beneficiaries?: number;
  female_beneficiaries?: number;
  children_beneficiaries?: number;
  display_color?: string;
  display_icon?: string;
  // Progress metrics
  completion_percentage?: number;
  milestones_completed?: number;
  total_milestones?: number;
  is_active?: boolean;
  tags?: string[];
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// CSR Partner interface for displaying partner name
export interface CSRPartner {
  id: string;
  name: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
}

// User interface for team member names
export interface User {
  id: string;
  full_name: string;
  email?: string;
  designation?: string;
}

// Project with related data (partner name, manager names, etc.)
export interface ProjectWithDetails extends Project {
  partner_name?: string;
  project_manager_name?: string;
  assistant_manager_name?: string;
  team_member_count?: number;
  expense_count?: number;
  task_count?: number;
}

// Project statistics
export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  cancelled: number;
  totalBudget: number;
  utilizedBudget: number;
  pendingBudget: number;
  averageCompletion: number;
}

// Budget overview
export interface BudgetOverview {
  projectId: string;
  projectName: string;
  totalBudget: number;
  approvedBudget: number;
  utilizedBudget: number;
  pendingBudget: number;
  availableBudget: number;
  utilizationPercentage: number;
  overBudget: boolean;
}

class ProjectsService {
  /**
   * Get all projects from database
   */
  async getAllProjects(): Promise<ProjectWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch partner names for all projects
      const projectsWithDetails = await Promise.all(
        (data || []).map(async (project: Project) => {
          const partnerName = await this.getPartnerName(project.csr_partner_id);
          const managerName = await this.getUserName(project.project_manager_id);
          const assistantName = await this.getUserName(project.assistant_manager_id);
          const teamMemberCount = await this.getProjectTeamMemberCount(project.id);
          const taskCount = await this.getProjectTaskCount(project.id);
          const expenseCount = await this.getProjectExpenseCount(project.id);

          return {
            ...project,
            partner_name: partnerName,
            project_manager_name: managerName,
            assistant_manager_name: assistantName,
            team_member_count: teamMemberCount,
            task_count: taskCount,
            expense_count: expenseCount,
          };
        })
      );

      return projectsWithDetails;
    } catch (error) {
      console.error('Error fetching all projects:', error);
      throw error;
    }
  }

  /**
   * Get project by ID with all details
   */
  async getProjectById(projectId: string): Promise<ProjectWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      if (!data) return null;

      const partnerName = await this.getPartnerName(data.csr_partner_id);
      const managerName = await this.getUserName(data.project_manager_id);
      const assistantName = await this.getUserName(data.assistant_manager_id);
      const teamMemberCount = await this.getProjectTeamMemberCount(projectId);
      const taskCount = await this.getProjectTaskCount(projectId);
      const expenseCount = await this.getProjectExpenseCount(projectId);

      return {
        ...data,
        partner_name: partnerName,
        project_manager_name: managerName,
        assistant_manager_name: assistantName,
        team_member_count: teamMemberCount,
        task_count: taskCount,
        expense_count: expenseCount,
      };
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      throw error;
    }
  }

  /**
   * Get projects filtered by status
   */
  async getProjectsByStatus(status: string): Promise<ProjectWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', status)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithDetails = await Promise.all(
        (data || []).map(async (project: Project) => {
          const partnerName = await this.getPartnerName(project.csr_partner_id);
          return {
            ...project,
            partner_name: partnerName,
          };
        })
      );

      return projectsWithDetails;
    } catch (error) {
      console.error('Error fetching projects by status:', error);
      throw error;
    }
  }

  /**
   * Search projects by name or partner name
   */
  async searchProjects(query: string): Promise<ProjectWithDetails[]> {
    try {
      // Search by project name or project code
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(
          `name.ilike.%${query}%,project_code.ilike.%${query}%,description.ilike.%${query}%`
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithDetails = await Promise.all(
        (data || []).map(async (project: Project) => {
          const partnerName = await this.getPartnerName(project.csr_partner_id);
          return {
            ...project,
            partner_name: partnerName,
          };
        })
      );

      return projectsWithDetails;
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }

  /**
   * Get projects by CSR partner
   */
  async getProjectsByPartner(partnerId: string): Promise<ProjectWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('csr_partner_id', partnerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const partnerName = await this.getPartnerName(partnerId);

      const projectsWithDetails = (data || []).map((project: Project) => ({
        ...project,
        partner_name: partnerName,
      }));

      return projectsWithDetails;
    } catch (error) {
      console.error('Error fetching projects by partner:', error);
      throw error;
    }
  }

  /**
   * Get projects by category
   */
  async getProjectsByCategory(category: string): Promise<ProjectWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithDetails = await Promise.all(
        (data || []).map(async (project: Project) => {
          const partnerName = await this.getPartnerName(project.csr_partner_id);
          return {
            ...project,
            partner_name: partnerName,
          };
        })
      );

      return projectsWithDetails;
    } catch (error) {
      console.error('Error fetching projects by category:', error);
      throw error;
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projects: ProjectWithDetails[]): Promise<ProjectStats> {
    const stats: ProjectStats = {
      total: projects.length,
      active: projects.filter((p) => p.status === 'active').length,
      completed: projects.filter((p) => p.status === 'completed').length,
      onHold: projects.filter((p) => p.status === 'on_hold').length,
      cancelled: projects.filter((p) => p.status === 'cancelled').length,
      totalBudget: projects.reduce((sum, p) => sum + (p.total_budget || 0), 0),
      utilizedBudget: projects.reduce((sum, p) => sum + (p.utilized_budget || 0), 0),
      pendingBudget: projects.reduce((sum, p) => sum + (p.pending_budget || 0), 0),
      averageCompletion:
        projects.length > 0
          ? projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / projects.length
          : 0,
    };

    return stats;
  }

  /**
   * Get budget overview for project
   */
  async getProjectBudgetOverview(projectId: string): Promise<BudgetOverview | null> {
    try {
      const project = await this.getProjectById(projectId);
      if (!project) return null;

      const availableBudget = (project.total_budget || 0) - (project.utilized_budget || 0);
      const utilizationPercentage =
        (project.total_budget || 0) > 0
          ? ((project.utilized_budget || 0) / (project.total_budget || 0)) * 100
          : 0;

      return {
        projectId: project.id,
        projectName: project.name,
        totalBudget: project.total_budget || 0,
        approvedBudget: project.approved_budget || 0,
        utilizedBudget: project.utilized_budget || 0,
        pendingBudget: project.pending_budget || 0,
        availableBudget: Math.max(0, availableBudget),
        utilizationPercentage,
        overBudget: availableBudget < 0,
      };
    } catch (error) {
      console.error('Error fetching budget overview:', error);
      throw error;
    }
  }

  /**
   * Create new project
   */
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Update project status
   */
  async updateProjectStatus(
    projectId: string,
    newStatus: string,
    completionPercentage?: number
  ): Promise<Project | null> {
    try {
      const updates: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() };
      if (completionPercentage !== undefined) {
        updates.completion_percentage = completionPercentage;
      }

      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  }

  /**
   * Update project budget
   */
  async updateProjectBudget(
    projectId: string,
    totalBudget: number,
    approvedBudget: number
  ): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          total_budget: totalBudget,
          approved_budget: approvedBudget,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project budget:', error);
      throw error;
    }
  }

  /**
   * Archive project (soft delete)
   */
  async archiveProject(projectId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          is_active: false,
          status: 'archived',
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error archiving project:', error);
      throw error;
    }
  }

  /**
   * Get CSR partner name by ID
   */
  private async getPartnerName(partnerId?: string): Promise<string> {
    if (!partnerId) return 'Unknown Partner';

    try {
      const { data } = await supabase
        .from('csr_partners')
        .select('name')
        .eq('id', partnerId)
        .single();

      return data?.name || 'Unknown Partner';
    } catch {
      return 'Unknown Partner';
    }
  }

  /**
   * Get user name by ID
   */
  private async getUserName(userId?: string): Promise<string> {
    if (!userId) return 'Unassigned';

    try {
      const { data } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', userId)
        .single();

      return data?.full_name || 'Unassigned';
    } catch {
      return 'Unassigned';
    }
  }

  /**
   * Get team member count for project
   */
  private async getProjectTeamMemberCount(projectId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('project_team_members')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId)
        .eq('is_active', true);

      return count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get task count for project
   */
  private async getProjectTaskCount(projectId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId)
        .eq('is_active', true);

      return count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get expense count for project
   */
  private async getProjectExpenseCount(projectId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('project_expenses')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId);

      return count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Create beneficiary sub-projects for a parent project
   */
  async createBeneficiarySubProjects(
    parentProject: Project,
    count: number
  ): Promise<Project[]> {
    if (count <= 0) return [];

    const subProjects: Omit<Project, 'id' | 'created_at' | 'updated_at'>[] = [];
    
    for (let i = 1; i <= count; i++) {
      const subProjectCode = `${parentProject.project_code}-B${i.toString().padStart(3, '0')}`;
      subProjects.push({
        project_code: subProjectCode,
        name: `${parentProject.name} - Beneficiary ${i}`,
        description: `Beneficiary sub-project ${i} of ${count} for ${parentProject.name}`,
        csr_partner_id: parentProject.csr_partner_id,
        toll_id: parentProject.toll_id,
        location: parentProject.location,
        state: parentProject.state,
        work: parentProject.work,
        status: 'planning',
        start_date: parentProject.start_date,
        expected_end_date: parentProject.expected_end_date,
        parent_project_id: parentProject.id,
        is_beneficiary_project: true,
        beneficiary_number: i,
        is_active: true,
        total_budget: 0,
        direct_beneficiaries: 1,
        total_beneficiaries: 1,
        impact_metrics: [], // Initialize with empty impact metrics for individual tracking
      });
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(subProjects)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error creating beneficiary sub-projects:', error);
      throw error;
    }
  }

  /**
   * Get sub-projects for a parent project
   */
  async getSubProjects(parentProjectId: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('parent_project_id', parentProjectId)
        .eq('is_active', true)
        .order('beneficiary_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sub-projects:', error);
      throw error;
    }
  }

  /**
   * Get sub-project count for a parent project
   */
  async getSubProjectCount(parentProjectId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('parent_project_id', parentProjectId)
        .eq('is_active', true);

      return count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Update a sub-project's impact metrics
   */
  async updateSubProjectImpactMetrics(
    subProjectId: string,
    impactMetrics: ImpactMetricEntry[]
  ): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ impact_metrics: impactMetrics, updated_at: new Date().toISOString() })
        .eq('id', subProjectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating sub-project impact metrics:', error);
      throw error;
    }
  }
}

export const projectsService = new ProjectsService();
