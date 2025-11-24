import { supabase } from './supabaseClient';

export interface MediaArticle {
  id: string;
  media_code: string;
  project_id: string;
  title: string;
  description: string;
  media_type: 'photo' | 'video' | 'document' | 'certificate';
  drive_link: string;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const mediaService = {
  async getAllMedia(): Promise<MediaArticle[]> {
    try {
      const { data, error } = await supabase
        .from('media_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching media:', error);
      return [];
    }
  },

  async getMediaByProject(projectId: string): Promise<MediaArticle[]> {
    try {
      const { data, error } = await supabase
        .from('media_articles')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching media:', error);
      return [];
    }
  },

  async createMedia(media: Omit<MediaArticle, 'id' | 'created_at' | 'updated_at'>): Promise<MediaArticle | null> {
    try {
      const { data, error } = await supabase
        .from('media_articles')
        .insert([media])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating media:', error);
      return null;
    }
  },

  async updateMedia(mediaId: string, updates: Partial<MediaArticle>): Promise<MediaArticle | null> {
    try {
      const { data, error } = await supabase
        .from('media_articles')
        .update(updates)
        .eq('id', mediaId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating media:', error);
      return null;
    }
  },
};
