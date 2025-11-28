import { supabase } from './supabaseClient';

export type ProjectTeamRole = 'accountant' | 'team_member' | 'project_manager';

export interface ProjectTeamMemberInput {
  project_id: string;
  user_id: string;
  role: ProjectTeamRole;
}

export interface ProjectTeamMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string | null;
  designation: string | null;
  responsibilities: string | null;
  is_lead: boolean;
  can_approve_expenses: boolean;
  can_assign_tasks: boolean;
  access_level: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  roles: string[] | null;
}

export interface ProjectTeamMemberWithUser extends ProjectTeamMember {
  user?: {
    id: string;
    full_name: string;
    email?: string;
  } | null;
}

const roleAccessLevelMap: Record<ProjectTeamRole, 'full' | 'limited'> = {
  project_manager: 'full',
  accountant: 'limited',
  team_member: 'limited',
};

const roleLeadFlag: Record<ProjectTeamRole, boolean> = {
  project_manager: true,
  accountant: false,
  team_member: false,
};

export const addProjectTeamMembers = async (
  members: ProjectTeamMemberInput[]
): Promise<ProjectTeamMember[]> => {
  if (!members.length) return [];

  const payload = members.map((member) => ({
    project_id: member.project_id,
    user_id: member.user_id,
    role: member.role,
    roles: [member.role],
    is_lead: roleLeadFlag[member.role],
    access_level: roleAccessLevelMap[member.role],
    is_active: true,
  }));

  const { data, error } = await supabase
    .from('project_team_members')
    .insert(payload)
    .select();

  if (error) throw error;
  return data || [];
};

export const removeProjectTeamMembers = async (projectId: string): Promise<void> => {
  const { error } = await supabase
    .from('project_team_members')
    .delete()
    .eq('project_id', projectId);

  if (error) throw error;
};

export const replaceProjectTeamMembers = async (
  projectId: string,
  members: ProjectTeamMemberInput[]
): Promise<ProjectTeamMember[]> => {
  await removeProjectTeamMembers(projectId);
  if (!members.length) return [];
  return addProjectTeamMembers(members);
};

export const fetchProjectTeamMembers = async (
  projectId: string
): Promise<ProjectTeamMemberWithUser[]> => {
  const { data, error } = await supabase
    .from('project_team_members')
    .select(
      `id, project_id, user_id, role, designation, responsibilities, is_lead, can_approve_expenses, can_assign_tasks, access_level, is_active, notes, created_at, updated_at, created_by, updated_by, roles,
      user:users(id, full_name, email)`
    )
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map((member) => {
    const rawUser = Array.isArray(member.user) ? member.user[0] ?? null : member.user;
    return {
      ...member,
      role: member.role as ProjectTeamRole | null,
      user: rawUser
        ? {
            id: rawUser.id,
            full_name: rawUser.full_name,
            email: rawUser.email,
          }
        : null,
    };
  });
};

export const projectTeamMembersService = {
  addProjectTeamMembers,
  removeProjectTeamMembers,
  replaceProjectTeamMembers,
  fetchProjectTeamMembers,
};

export default projectTeamMembersService;
