import { supabase } from './supabaseClient';

export interface Project {
  id: string;
  project_code: string;
  name: string;
  description: string;
  csr_partner_id: string;
  project_manager_id: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold' | 'upcoming';
  start_date: string;
  expected_end_date: string;
  total_budget: number;
  utilized_budget: number;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface BeneficiaryMetrics {
  beneficiaries: { current: number; target: number };
  pads: { current: number; target: number };
  meals: { current: number; target: number };
  students: { current: number; target: number };
  trees: { current: number; target: number };
  schools: { current: number; target: number };
}

export interface MonthlyPerformance {
  month: string;
  completed: number;
  ongoing: number;
}

export interface ProjectStats {
  active: number;
  upcoming: number;
  completed: number;
  onHold: number;
  ongoing?: number;
}

export interface Activity {
  id: string;
  project: string;
  action: string;
  time: string;
  status: 'completed' | 'pending' | 'alert';
}

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  },

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
      return null;
    }
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  },

  async getProjectsByStatus(status: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects by status:', error);
      return [];
    }
  },

  async getProjectStats(projects: Project[]): Promise<ProjectStats> {
    try {
      return {
        active: projects.filter(p => p.status === 'active').length,
        upcoming: projects.filter(p => p.status === 'upcoming').length,
        completed: projects.filter(p => p.status === 'completed').length,
        onHold: projects.filter(p => p.status === 'on_hold').length,
        ongoing: projects.filter(p => p.status === 'active').length,
      };
    } catch (error) {
      console.error('Error calculating project stats:', error);
      return { active: 0, upcoming: 0, completed: 0, onHold: 0, ongoing: 0 };
    }
  },

  async getBeneficiaryMetrics(projects: Project[]): Promise<BeneficiaryMetrics> {
    try {
      const metrics: BeneficiaryMetrics = {
        beneficiaries: { current: 0, target: 0 },
        pads: { current: 0, target: 0 },
        meals: { current: 0, target: 0 },
        students: { current: 0, target: 0 },
        trees: { current: 0, target: 0 },
        schools: { current: 0, target: 0 },
      };

      projects.forEach(project => {
        const meta = project.metadata || {};
        metrics.beneficiaries.current += meta.beneficiaries_current as number || 0;
        metrics.beneficiaries.target += meta.beneficiaries_target as number || 0;
        metrics.pads.current += meta.pads_donated_current as number || 0;
        metrics.pads.target += meta.pads_donated_target as number || 0;
        metrics.meals.current += meta.meals_distributed_current as number || 0;
        metrics.meals.target += meta.meals_distributed_target as number || 0;
        metrics.students.current += meta.students_enrolled_current as number || 0;
        metrics.students.target += meta.students_enrolled_target as number || 0;
        metrics.trees.current += meta.trees_planted_current as number || 0;
        metrics.trees.target += meta.trees_planted_target as number || 0;
        metrics.schools.current += meta.schools_renovated_current as number || 0;
        metrics.schools.target += meta.schools_renovated_target as number || 0;
      });

      return metrics;
    } catch (error) {
      console.error('Error calculating beneficiary metrics:', error);
      return {
        beneficiaries: { current: 0, target: 0 },
        pads: { current: 0, target: 0 },
        meals: { current: 0, target: 0 },
        students: { current: 0, target: 0 },
        trees: { current: 0, target: 0 },
        schools: { current: 0, target: 0 },
      };
    }
  },

  async getMonthlyPerformance(projects: Project[]): Promise<MonthlyPerformance[]> {
    try {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      const performance: MonthlyPerformance[] = [];
      
      for (let i = Math.max(0, currentMonth - 5); i <= currentMonth; i++) {
        const monthStart = new Date(currentYear, i, 1);
        const monthEnd = new Date(currentYear, i + 1, 0);
        
        const completedCount = projects.filter(p => {
          if (p.status !== 'completed') return false;
          const endDate = new Date(p.expected_end_date);
          return endDate >= monthStart && endDate <= monthEnd;
        }).length;
        
        const ongoingCount = projects.filter(p => {
          if (p.status !== 'active') return false;
          const startDate = new Date(p.start_date);
          return startDate <= monthEnd;
        }).length;
        
        performance.push({
          month: months[i],
          completed: completedCount,
          ongoing: ongoingCount,
        });
      }
      
      return performance;
    } catch (error) {
      console.error('Error calculating monthly performance:', error);
      return [];
    }
  },

  async getRecentActivities(limit: number = 4): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, projects(name, status)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return (data || []).map(activity => ({
        id: activity.projects?.id || activity.id,
        project: activity.projects?.name || 'Unknown Project',
        action: activity.action || 'Updated',
        time: this.formatTimeAgo(activity.created_at),
        status: activity.projects?.status === 'completed' ? 'completed' :
                activity.projects?.status === 'active' ? 'pending' : 'alert'
      }));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  },

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  },

  async searchProjects(query: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,project_code.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  },

  async updateProjectBudget(projectId: string, utilizationAmount: number): Promise<Project | null> {
    try {
      const project = await this.getProjectById(projectId);
      if (!project) return null;
      
      const newUtilizedBudget = project.utilized_budget + utilizationAmount;
      const completionPercentage = (newUtilizedBudget / project.total_budget) * 100;
      
      return this.updateProject(projectId, {
        utilized_budget: newUtilizedBudget,
        completion_percentage: Math.min(completionPercentage, 100)
      });
    } catch (error) {
      console.error('Error updating project budget:', error);
      return null;
    }
  },

  async updateProjectCompletion(projectId: string, percentage: number): Promise<Project | null> {
    try {
      return this.updateProject(projectId, {
        completion_percentage: Math.min(Math.max(percentage, 0), 100)
      });
    } catch (error) {
      console.error('Error updating project completion:', error);
      return null;
    }
  },

  async getProjectsByPartner(partnerId: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('csr_partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects by partner:', error);
      return [];
    }
  },
};
