import { supabase } from './supabaseClient';
import type { ProjectActivity } from './projectActivitiesService';

export interface ActivityTemplate {
  id: string;
  name: string;
  description?: string;
  activities: ActivityTemplateActivity[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityTemplateActivity {
  title: string;
  description?: string;
  priority: ProjectActivity['priority'];
  start_date_offset?: number; // Days from project start
  end_date_offset?: number;   // Days from project start
  responsible_person?: string;
  items?: Array<{
    text: string;
    order: number;
  }>;
}

export interface CreateActivityTemplateInput {
  name: string;
  description?: string;
  activities: ActivityTemplateActivity[];
  created_by?: string;
}

/**
 * Get all activity templates
 */
export async function getAllActivityTemplates(): Promise<ActivityTemplate[]> {
  const { data, error } = await supabase
    .from('activity_templates')
    .select(`
      id,
      name,
      description,
      activities,
      created_by,
      created_at,
      updated_at
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching activity templates:', error);
    
    // Check if table doesn't exist
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.error('❌ DATABASE TABLE MISSING! Please run: MIGRATION_ADD_ACTIVITY_TEMPLATES_TABLE.sql');
      throw new Error('Database table "activity_templates" does not exist. Please run the migration SQL file first. See DATABASE_SETUP_REQUIRED.md');
    }
    
    throw error;
  }

  return data || [];
}

/**
 * Get a single activity template by ID
 */
export async function getActivityTemplateById(templateId: string): Promise<ActivityTemplate | null> {
  const { data, error } = await supabase
    .from('activity_templates')
    .select(`
      id,
      name,
      description,
      activities,
      created_by,
      created_at,
      updated_at
    `)
    .eq('id', templateId)
    .single();

  if (error) {
    console.error('Error fetching activity template:', error);
    throw error;
  }

  return data || null;
}

/**
 * Create a new activity template
 */
export async function createActivityTemplate(input: CreateActivityTemplateInput): Promise<ActivityTemplate> {
  const { data, error } = await supabase
    .from('activity_templates')
    .insert({
      name: input.name,
      description: input.description,
      activities: input.activities,
      created_by: input.created_by,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating activity template:', error);
    
    // Check if table doesn't exist
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.error('❌ DATABASE TABLE MISSING! Please run: MIGRATION_ADD_ACTIVITY_TEMPLATES_TABLE.sql');
      throw new Error('Database table "activity_templates" does not exist. Please run the migration SQL file first. See DATABASE_SETUP_REQUIRED.md');
    }
    
    throw error;
  }

  return data;
}

/**
 * Update an activity template
 */
export async function updateActivityTemplate(
  templateId: string,
  updates: Partial<CreateActivityTemplateInput>
): Promise<ActivityTemplate> {
  const { data, error } = await supabase
    .from('activity_templates')
    .update({
      name: updates.name,
      description: updates.description,
      activities: updates.activities,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .select()
    .single();

  if (error) {
    console.error('Error updating activity template:', error);
    throw error;
  }

  return data;
}

/**
 * Delete an activity template
 */
export async function deleteActivityTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('activity_templates')
    .delete()
    .eq('id', templateId);

  if (error) {
    console.error('Error deleting activity template:', error);
    throw error;
  }
}
