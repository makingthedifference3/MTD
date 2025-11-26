import { supabase } from './supabaseClient';

/**
 * RealTimeUpdatesService - Manages all database operations for real-time updates
 * Handles CRUD operations, filtering, searching, and real-time subscriptions
 */

// Real-Time Update interface matching the database schema
export interface RealTimeUpdate {
  id: string;
  update_code: string;
  project_id: string;
  task_id?: string;
  timeline_id?: string;
  title?: string;
  description?: string;
  update_type?: 'Progress' | 'Issue' | 'Achievement' | 'Milestone';
  category?: string;
  update_number?: number;
  document_number?: string;
  reference_number?: string;
  date?: string;
  time?: string;
  location_name?: string;
  school_name?: string;
  institution_name?: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  images?: Record<string, unknown>;
  videos?: Record<string, unknown>;
  documents?: Record<string, unknown>;
  participants?: string[];
  beneficiaries_count?: number;
  attendees_count?: number;
  impact_data?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
  is_public?: boolean;
  is_featured?: boolean;
  is_sent_to_client?: boolean;
  sent_date?: string;
  format_type?: string;
  tags?: string[];
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// Update with related data
export interface RealTimeUpdateWithDetails extends RealTimeUpdate {
  project_name?: string;
  project_code?: string;
  task_title?: string;
  created_by_name?: string;
  updated_by_name?: string;
  days_ago?: string;
}

// Update statistics
export interface UpdateStats {
  total: number;
  progress: number;
  issue: number;
  achievement: number;
  milestone: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

// Update by priority
export interface UpdateByPriority {
  high: number;
  medium: number;
  low: number;
}

class RealTimeUpdatesService {
  /**
   * Get all real-time updates from database
   */
  async getAllUpdates(): Promise<RealTimeUpdateWithDetails[]> {
    try {
      console.log('Fetching all updates...');
      const { data, error } = await supabase
        .from('real_time_updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched updates:', data?.length || 0);

      if (!data || data.length === 0) {
        return [];
      }

      // Enrich with related data
      const updatesWithDetails = await Promise.all(
        data.map(async (update: RealTimeUpdate) => {
          const projectName = await this.getProjectName(update.project_id);
          const daysAgo = this.calculateTimeAgo(update.created_at);

          return {
            ...update,
            project_name: projectName,
            days_ago: daysAgo,
          };
        })
      );

      console.log('Enriched updates:', updatesWithDetails.length);
      return updatesWithDetails;
    } catch (error) {
      console.error('Error fetching all updates:', error);
      return [];
    }
  }

  /**
   * Get updates by project
   */
  async getUpdatesByProject(projectId: string): Promise<RealTimeUpdateWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectName = await this.getProjectName(projectId);

      const updatesWithDetails = (data || []).map((update: RealTimeUpdate) => ({
        ...update,
        project_name: projectName,
        days_ago: this.calculateTimeAgo(update.created_at),
      }));

      return updatesWithDetails;
    } catch (error) {
      console.error('Error fetching updates by project:', error);
      throw error;
    }
  }

  /**
   * Get updates by type
   */
  async getUpdatesByType(updateType: 'Progress' | 'Issue' | 'Achievement' | 'Milestone'): Promise<RealTimeUpdateWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .select('*')
        .eq('update_type', updateType)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const updatesWithDetails = await Promise.all(
        (data || []).map(async (update: RealTimeUpdate) => {
          const projectName = await this.getProjectName(update.project_id);
          return {
            ...update,
            project_name: projectName,
            days_ago: this.calculateTimeAgo(update.created_at),
          };
        })
      );

      return updatesWithDetails;
    } catch (error) {
      console.error('Error fetching updates by type:', error);
      throw error;
    }
  }

  /**
   * Get featured updates (for homepage/dashboard)
   */
  async getFeaturedUpdates(limit: number = 5): Promise<RealTimeUpdateWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .select('*')
        .eq('is_featured', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const updatesWithDetails = await Promise.all(
        (data || []).map(async (update: RealTimeUpdate) => {
          const projectName = await this.getProjectName(update.project_id);
          return {
            ...update,
            project_name: projectName,
            days_ago: this.calculateTimeAgo(update.created_at),
          };
        })
      );

      return updatesWithDetails;
    } catch (error) {
      console.error('Error fetching featured updates:', error);
      throw error;
    }
  }

  /**
   * Search updates by title, description, location
   */
  async searchUpdates(query: string): Promise<RealTimeUpdateWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .select('*')
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,location_name.ilike.%${query}%,school_name.ilike.%${query}%,institution_name.ilike.%${query}%`
        )
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const updatesWithDetails = await Promise.all(
        (data || []).map(async (update: RealTimeUpdate) => {
          const projectName = await this.getProjectName(update.project_id);
          return {
            ...update,
            project_name: projectName,
            days_ago: this.calculateTimeAgo(update.created_at),
          };
        })
      );

      return updatesWithDetails;
    } catch (error) {
      console.error('Error searching updates:', error);
      throw error;
    }
  }

  /**
   * Get recent updates (last N days)
   */
  async getRecentUpdates(days: number = 30): Promise<RealTimeUpdateWithDetails[]> {
    try {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);

      const { data, error } = await supabase
        .from('real_time_updates')
        .select('*')
        .gte('created_at', sinceDate.toISOString())
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const updatesWithDetails = await Promise.all(
        (data || []).map(async (update: RealTimeUpdate) => {
          const projectName = await this.getProjectName(update.project_id);
          return {
            ...update,
            project_name: projectName,
            days_ago: this.calculateTimeAgo(update.created_at),
          };
        })
      );

      return updatesWithDetails;
    } catch (error) {
      console.error('Error fetching recent updates:', error);
      throw error;
    }
  }

  /**
   * Get updates by date range
   */
  async getUpdatesByDateRange(startDate: string, endDate: string): Promise<RealTimeUpdateWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('is_public', true)
        .order('date', { ascending: false });

      if (error) throw error;

      const updatesWithDetails = await Promise.all(
        (data || []).map(async (update: RealTimeUpdate) => {
          const projectName = await this.getProjectName(update.project_id);
          return {
            ...update,
            project_name: projectName,
            days_ago: this.calculateTimeAgo(update.created_at),
          };
        })
      );

      return updatesWithDetails;
    } catch (error) {
      console.error('Error fetching updates by date range:', error);
      throw error;
    }
  }

  /**
   * Get update statistics
   */
  async getUpdateStats(updates: RealTimeUpdateWithDetails[]): Promise<UpdateStats> {
    const stats: UpdateStats = {
      total: updates.length,
      progress: updates.filter((u) => u.update_type === 'Progress').length,
      issue: updates.filter((u) => u.update_type === 'Issue').length,
      achievement: updates.filter((u) => u.update_type === 'Achievement').length,
      milestone: updates.filter((u) => u.update_type === 'Milestone').length,
      highPriority: Math.ceil(updates.length * 0.3), // First 30% are high priority
      mediumPriority: Math.ceil(updates.length * 0.4), // Next 40% are medium
      lowPriority: Math.floor(updates.length * 0.3), // Remaining are low
    };

    return stats;
  }

  /**
   * Get updates by priority (based on recency)
   */
  getUpdatePriority(index: number, total: number): 'high' | 'medium' | 'low' {
    const highPriorityThreshold = Math.ceil(total * 0.3);
    const mediumPriorityThreshold = Math.ceil(total * 0.7);

    if (index < highPriorityThreshold) return 'high';
    if (index < mediumPriorityThreshold) return 'medium';
    return 'low';
  }

  /**
   * Create new update
   */
  async createUpdate(
    update: Omit<RealTimeUpdate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<RealTimeUpdate | null> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .insert([update])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating update:', error);
      throw error;
    }
  }

  /**
   * Update existing update
   */
  async updateUpdate(updateId: string, updates: Partial<RealTimeUpdate>): Promise<RealTimeUpdate | null> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', updateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating update:', error);
      throw error;
    }
  }

  /**
   * Feature/unfeature update
   */
  async toggleFeatured(updateId: string, isFeatured: boolean): Promise<RealTimeUpdate | null> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
        .eq('id', updateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  }

  /**
   * Send update to client
   */
  async sendToClient(updateId: string): Promise<RealTimeUpdate | null> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .update({
          is_sent_to_client: true,
          sent_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', updateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending update to client:', error);
      throw error;
    }
  }

  /**
   * Delete update (soft delete)
   */
  async deleteUpdate(updateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('real_time_updates')
        .update({ is_public: false, updated_at: new Date().toISOString() })
        .eq('id', updateId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting update:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates
   * @param callback - Callback function for real-time updates
   * @returns null - Placeholder for future real-time implementation
   */
  subscribeToUpdates(callback: (update: RealTimeUpdate) => void): null {
    // Note: Real-time subscriptions require a RealtimeClient, not PostgrestQueryBuilder
    // This is a placeholder that maintains the method signature
    // The callback parameter is intended for future real-time functionality
    // For actual real-time functionality, you need to use RealtimeClient:
    // const subscription = supabase.realtime.from('real_time_updates').on('*', callback).subscribe();
    void callback; // Intentionally unused, kept for future implementation
    return null;
  }

  /**
   * Get project name by ID
   */
  private async getProjectName(projectId?: string): Promise<string> {
    if (!projectId) return 'Unknown Project';

    try {
      const { data } = await supabase.from('projects').select('name').eq('id', projectId).single();

      return data?.name || 'Unknown Project';
    } catch {
      return 'Unknown Project';
    }
  }


  /**
   * Calculate time ago string from timestamp
   */
  private calculateTimeAgo(timestamp?: string): string {
    if (!timestamp) return 'Recently';

    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  }
}

export const realTimeUpdatesService = new RealTimeUpdatesService();
