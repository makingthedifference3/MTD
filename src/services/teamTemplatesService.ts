import { supabase } from './supabaseClient';
import type { ProjectTeamRole } from './projectTeamMembersService';

export interface TeamTemplate {
  id: string;
  name: string;
  description?: string;
  members: TeamTemplateMember[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeamTemplateMember {
  user_id: string;
  role: ProjectTeamRole;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CreateTeamTemplateInput {
  name: string;
  description?: string;
  members: Array<{
    user_id: string;
    role: ProjectTeamRole;
  }>;
  created_by?: string;
}

/**
 * Get all team templates
 */
export async function getAllTeamTemplates(): Promise<TeamTemplate[]> {
  const { data, error } = await supabase
    .from('team_templates')
    .select(`
      id,
      name,
      description,
      members,
      created_by,
      created_at,
      updated_at
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching team templates:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single team template by ID with user details populated
 */
export async function getTeamTemplateById(templateId: string): Promise<TeamTemplate | null> {
  const { data, error } = await supabase
    .from('team_templates')
    .select(`
      id,
      name,
      description,
      members,
      created_by,
      created_at,
      updated_at
    `)
    .eq('id', templateId)
    .single();

  if (error) {
    console.error('Error fetching team template:', error);
    throw error;
  }

  if (!data) return null;

  // Fetch user details for each member
  const memberUserIds = (data.members as TeamTemplateMember[]).map((m) => m.user_id);
  
  if (memberUserIds.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', memberUserIds);

    if (usersError) {
      console.error('Error fetching template member users:', usersError);
    } else {
      // Attach user info to each member
      const membersWithUsers = (data.members as TeamTemplateMember[]).map((member) => ({
        ...member,
        user: users?.find((u) => u.id === member.user_id),
      }));
      data.members = membersWithUsers;
    }
  }

  return data as TeamTemplate;
}

/**
 * Create a new team template
 */
export async function createTeamTemplate(
  input: CreateTeamTemplateInput
): Promise<TeamTemplate> {
  const { data, error } = await supabase
    .from('team_templates')
    .insert([
      {
        name: input.name,
        description: input.description,
        members: input.members,
        created_by: input.created_by,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating team template:', error);
    throw error;
  }

  return data as TeamTemplate;
}

/**
 * Update an existing team template
 */
export async function updateTeamTemplate(
  templateId: string,
  updates: {
    name?: string;
    description?: string;
    members?: Array<{
      user_id: string;
      role: ProjectTeamRole;
    }>;
  }
): Promise<TeamTemplate> {
  const { data, error } = await supabase
    .from('team_templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .select()
    .single();

  if (error) {
    console.error('Error updating team template:', error);
    throw error;
  }

  return data as TeamTemplate;
}

/**
 * Delete a team template
 */
export async function deleteTeamTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('team_templates')
    .delete()
    .eq('id', templateId);

  if (error) {
    console.error('Error deleting team template:', error);
    throw error;
  }
}
