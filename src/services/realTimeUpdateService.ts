import { supabase } from './supabaseClient';

export interface RealTimeUpdate {
  id: string;
  update_code: string;
  project_id: string;
  task_id: string | null;
  title: string;
  description: string;
  update_type: 'Progress' | 'Issue' | 'Achievement' | 'Milestone';
  date: string;
  location_name: string;
  images: Record<string, string>;
  videos: Record<string, string>;
  participants: string[];
  beneficiaries_count: number;
  is_public: boolean;
  is_featured: boolean;
  is_sent_to_client: boolean;
  created_at: string;
  updated_at: string;
}

export const realTimeUpdateService = {
  async getAllUpdates(): Promise<RealTimeUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching updates:', error);
      return [];
    }
  },

  async getUpdatesByProject(projectId: string): Promise<RealTimeUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching updates:', error);
      return [];
    }
  },

  async getFeaturedUpdates(): Promise<RealTimeUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .select('*')
        .eq('is_featured', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured updates:', error);
      return [];
    }
  },

  async createUpdate(update: Omit<RealTimeUpdate, 'id' | 'created_at' | 'updated_at'>): Promise<RealTimeUpdate | null> {
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
      return null;
    }
  },

  async updateUpdate(updateId: string, updates: Partial<RealTimeUpdate>): Promise<RealTimeUpdate | null> {
    try {
      const { data, error } = await supabase
        .from('real_time_updates')
        .update(updates)
        .eq('id', updateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating update:', error);
      return null;
    }
  },
};
