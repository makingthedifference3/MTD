import { supabase } from './supabaseClient';

/**
 * Media Article Service
 * Provides CRUD operations for managing articles and blog posts
 * Data source: media_articles table
 */

export interface MediaArticle {
  id: string;
  media_code: string;
  project_id?: string;
  title: string;
  description?: string;
  media_type: 'photo' | 'video' | 'document' | 'pdf' | 'newspaper_cutting' | 'certificate' | 'report';
  category?: string;
  sub_category?: string;
  drive_link?: string;
  status?: 'draft' | 'published' | 'pending';
  publication_date?: string;
  reporter_name?: string;
  uploaded_by?: string;
  approved_by?: string | null;
  approval_date?: string;
  views_count?: number;
  downloads_count?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  is_public?: boolean;
}

export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  pending: number;
}

// Get all articles with optional filtering
export const getAllArticles = async (
  status?: 'published' | 'draft' | 'pending'
): Promise<MediaArticle[]> => {
  try {
    let query = supabase.from('media_articles').select(
      'id, media_code, project_id, title, description, media_type, category, sub_category, publication_date, reporter_name, uploaded_by, approved_by, approval_date, views_count, downloads_count, notes, created_at, updated_at, created_by, is_public'
    );

    if (status) {
      // Map status to match schema - articles can have 'draft', 'verified', or inferred status based on approval
      if (status === 'published') {
        query = query.eq('is_public', true).not('approved_by', 'is', null);
      } else if (status === 'draft') {
        query = query.eq('is_public', false).is('approved_by', null);
      } else if (status === 'pending') {
        query = query.is('approved_by', null).eq('is_public', false);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching articles:', err);
    return [];
  }
};

// Get article by ID
export const getArticleById = async (id: string): Promise<MediaArticle | null> => {
  try {
    const { data, error } = await supabase
      .from('media_articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error(`Error fetching article ${id}:`, err);
    return null;
  }
};

// Get article statistics
export const getArticleStats = async (): Promise<ArticleStats> => {
  try {
    const { data, error } = await supabase
      .from('media_articles')
      .select('id, is_public, approved_by');

    if (error) throw error;

    const articles = data || [];
    const stats: ArticleStats = {
      total: articles.length,
      published: articles.filter(a => a.is_public && a.approved_by).length,
      draft: articles.filter(a => !a.is_public && !a.approved_by).length,
      pending: articles.filter(a => !a.is_public && !a.approved_by).length,
    };

    return stats;
  } catch (err) {
    console.error('Error fetching article statistics:', err);
    return { total: 0, published: 0, draft: 0, pending: 0 };
  }
};

// Create new article
export const createArticle = async (
  article: Omit<MediaArticle, 'id' | 'created_at' | 'updated_at'>
): Promise<MediaArticle | null> => {
  try {
    const { data, error } = await supabase
      .from('media_articles')
      .insert([article])
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error('Error creating article:', err);
    return null;
  }
};

// Update article
export const updateArticle = async (
  id: string,
  updates: Partial<MediaArticle>
): Promise<MediaArticle | null> => {
  try {
    const { data, error } = await supabase
      .from('media_articles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error(`Error updating article ${id}:`, err);
    return null;
  }
};

// Publish/unpublish article
export const publishArticle = async (id: string, publish: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('media_articles')
      .update({
        is_public: publish,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Error publishing article ${id}:`, err);
    return false;
  }
};

// Approve article
export const approveArticle = async (
  id: string,
  approvedBy: string,
  approvalDate: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('media_articles')
      .update({
        approved_by: approvedBy,
        approval_date: approvalDate,
        is_public: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Error approving article ${id}:`, err);
    return false;
  }
};

// Delete article
export const deleteArticle = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('media_articles').delete().eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Error deleting article ${id}:`, err);
    return false;
  }
};

// Get articles by category
export const getArticlesByCategory = async (category: string): Promise<MediaArticle[]> => {
  try {
    const { data, error } = await supabase
      .from('media_articles')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error fetching articles by category ${category}:`, err);
    return [];
  }
};

// Get articles by project
export const getArticlesByProject = async (projectId: string): Promise<MediaArticle[]> => {
  try {
    const { data, error } = await supabase
      .from('media_articles')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error fetching articles for project ${projectId}:`, err);
    return [];
  }
};

// Get popular articles (by views count)
export const getPopularArticles = async (limit: number = 5): Promise<MediaArticle[]> => {
  try {
    const { data, error } = await supabase
      .from('media_articles')
      .select('*')
      .eq('is_public', true)
      .order('views_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching popular articles:', err);
    return [];
  }
};

// Get articles by news channel (sub_category)
export const getArticlesByNewsChannel = async (newsChannel: string): Promise<MediaArticle[]> => {
  try {
    const { data, error } = await supabase
      .from('media_articles')
      .select('*')
      .eq('sub_category', newsChannel)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error fetching articles by news channel ${newsChannel}:`, err);
    return [];
  }
};

// Get articles by media type
export const getArticlesByMediaType = async (mediaType: string): Promise<MediaArticle[]> => {
  try {
    const { data, error } = await supabase
      .from('media_articles')
      .select('*')
      .eq('media_type', mediaType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error fetching articles by media type ${mediaType}:`, err);
    return [];
  }
};

// Increment views count
export const incrementViewsCount = async (id: string): Promise<boolean> => {
  try {
    const article = await getArticleById(id);
    if (!article) return false;

    const { error } = await supabase
      .from('media_articles')
      .update({
        views_count: (article.views_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Error incrementing views for article ${id}:`, err);
    return false;
  }
};

// Increment downloads count
export const incrementDownloadsCount = async (id: string): Promise<boolean> => {
  try {
    const article = await getArticleById(id);
    if (!article) return false;

    const { error } = await supabase
      .from('media_articles')
      .update({
        downloads_count: (article.downloads_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Error incrementing downloads for article ${id}:`, err);
    return false;
  }
};

// Batch delete articles
export const deleteArticles = async (ids: string[]): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('media_articles')
      .delete()
      .in('id', ids);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting articles:', err);
    return false;
  }
};

// Search articles
export const searchArticles = async (searchTerm: string): Promise<MediaArticle[]> => {
  try {
    const { data, error } = await supabase
      .from('media_articles')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error searching articles with term "${searchTerm}":`, err);
    return [];
  }
};

// Get articles with pagination
export const getArticlesWithPagination = async (
  page: number = 1,
  pageSize: number = 10,
  status?: 'published' | 'draft' | 'pending'
): Promise<{ data: MediaArticle[]; total: number }> => {
  try {
    let query = supabase.from('media_articles').select('*', { count: 'exact' });

    if (status) {
      if (status === 'published') {
        query = query.eq('is_public', true).not('approved_by', 'is', null);
      } else if (status === 'draft') {
        query = query.eq('is_public', false).is('approved_by', null);
      }
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
    };
  } catch (err) {
    console.error('Error fetching articles with pagination:', err);
    return { data: [], total: 0 };
  }
};
