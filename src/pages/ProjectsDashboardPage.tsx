import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, MapPin, Users, Briefcase, Loader, Crown } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useSelectedProject } from '../context/useSelectedProject';
import { supabase } from '../services/supabaseClient';

interface ProjectWithRole {
  id: string;
  project_code: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  csr_partner_name: string;
  csr_partner_id: string;
  user_role: string;
  all_roles: string[];
  city?: string;
  state?: string;
  total_budget?: number;
}

interface TeamMemberData {
  role: string;
  project_id: string;
  projects: {
    id: string;
    project_code: string;
    name: string;
    status: string;
    start_date: string;
    expected_end_date: string;
    total_budget?: number;
    csr_partner_id: string;
  }[];
}

interface CSRPartner {
  id: string;
  company_name: string;
}

export default function ProjectsDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { setSelectedProject } = useSelectedProject();
  const [projects, setProjects] = useState<ProjectWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser?.id) {
      navigate('/');
      return;
    }

    const fetchUserProjects = async () => {
      try {
        setIsLoading(true);
        setError('');

        console.log('Fetching projects for user:', currentUser?.id, currentUser?.username);

        // Query: Get all projects where user is in project_team_members table
        // Step 1: Get user's project_team_members with project_id and csr_partner_id
        const { data: teamMembersData, error: teamMembersError } = await supabase
          .from('project_team_members')
          .select(`
            role,
            project_id,
            projects (
              id,
              project_code,
              name,
              status,
              start_date,
              expected_end_date,
              total_budget,
              csr_partner_id
            )
          `)
          .eq('user_id', currentUser.id);

        if (teamMembersError) {
          console.error('Error fetching team members:', teamMembersError);
          setError('Failed to load projects');
          setIsLoading(false);
          return;
        }

        // Step 2: Extract unique csr_partner_ids
        const uniqueCSRPartnerIds = new Set<string>();
        (teamMembersData || []).forEach((item: TeamMemberData) => {
          const projectData = Array.isArray(item.projects) ? item.projects[0] : item.projects;
          if (projectData?.csr_partner_id) {
            uniqueCSRPartnerIds.add(projectData.csr_partner_id);
          }
        });

        // Step 3: Fetch CSR partner details for all unique IDs
        const csrPartnerMap = new Map<string, string>();
        if (uniqueCSRPartnerIds.size > 0) {
          const { data: csrPartnersData, error: csrPartnersError } = await supabase
            .from('csr_partners')
            .select('id, company_name')
            .in('id', Array.from(uniqueCSRPartnerIds));

          if (csrPartnersError) {
            console.error('Error fetching CSR partners:', csrPartnersError);
          } else {
            (csrPartnersData || []).forEach((partner: CSRPartner) => {
              csrPartnerMap.set(partner.id, partner.company_name);
            });
          }
        }

        // Transform data - One project per user with their single role
        // Transform data - One project per user with their single role
        const transformedProjects: ProjectWithRole[] = [];
        
        (teamMembersData || []).forEach((item: TeamMemberData) => {
          // Handle both array and object responses
          const projectData = Array.isArray(item.projects) 
            ? item.projects[0] 
            : item.projects;
          if (projectData && projectData.id) {
            const csrPartnerName = projectData.csr_partner_id 
              ? csrPartnerMap.get(projectData.csr_partner_id) || 'N/A' 
              : 'N/A';

            transformedProjects.push({
              id: projectData.id,
              project_code: projectData.project_code,
              name: projectData.name,
              status: projectData.status,
              start_date: projectData.start_date,
              end_date: projectData.expected_end_date,
              total_budget: projectData.total_budget,
              csr_partner_id: projectData.csr_partner_id,
              csr_partner_name: csrPartnerName,
              user_role: item.role,
              all_roles: [item.role], // Single role in array
            });
          }
        });

        console.log('Transformed projects:', transformedProjects);

        console.log('Transformed projects:', transformedProjects);
        setProjects(transformedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('An error occurred while loading projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProjects();
  }, [currentUser?.id, currentUser?.username, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProjectSelect = (project: ProjectWithRole) => {
    // Store selected project and role in context and localStorage
    setSelectedProject(
      project.id,
      project.name,
      project.csr_partner_id,
      project.csr_partner_name,
      project.user_role
    );
    
    // Route based on user's role in this project
    const normalizedRole = project.user_role.toLowerCase().trim();
    
    if (normalizedRole === 'accountant') {
      navigate('/accountant-dashboard');
    } else if (normalizedRole === 'project_manager' || normalizedRole === 'projectmanager') {
      navigate('/pm-dashboard');
    } else if (normalizedRole === 'admin') {
      navigate('/admin-dashboard');
    } else if (normalizedRole === 'team_member' || normalizedRole === 'team member' || normalizedRole === 'member') {
      navigate('/team-member-dashboard');
    } else {
      // Default to team member dashboard for unknown roles
      navigate('/team-member-dashboard');
    }
  };

  const getRoleColor = (role: string) => {
    const normalizedRole = role.toLowerCase().trim();
    const roleColors: Record<string, string> = {
      'admin': 'bg-red-100 text-red-800 border-red-300',
      'project_manager': 'bg-blue-100 text-blue-800 border-blue-300',
      'projectmanager': 'bg-blue-100 text-blue-800 border-blue-300',
      'accountant': 'bg-green-100 text-green-800 border-green-300',
      'team_member': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'team member': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'member': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };
    return roleColors[normalizedRole] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'active': 'text-green-600',
      'on_hold': 'text-yellow-600',
      'completed': 'text-blue-600',
      'cancelled': 'text-red-600',
    };
    return statusColors[status] || 'text-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-tl from-emerald-50 via-white to-emerald-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-tl from-emerald-50 via-white to-emerald-100 relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <circle cx="20%" cy="80%" r="120" fill="#10b98119" />
        <rect x="70%" y="10%" width="170" height="110" rx="60" fill="#05966913" />
      </svg>

      {/* Header */}
      <div className="relative z-10 bg-white/85 backdrop-blur-xl shadow-md border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-emerald-600 p-2 shadow-lg ring-2 ring-emerald-200 rounded-2xl flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-black">
                My <span className="text-emerald-600">Projects</span>
              </h1>
              <p className="text-emerald-600 mt-1 font-semibold text-sm">Welcome back, {currentUser?.full_name || currentUser?.username} 👋</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-xl transition-all font-bold shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium"
          >
            {error}
          </motion.div>
        )}

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-emerald-100"
          >
            <Briefcase className="w-20 h-20 text-emerald-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">No Projects Yet</h2>
            <p className="text-gray-600 text-lg">You haven't been assigned to any projects yet.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => handleProjectSelect(project)}
                className="group rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all bg-white/80 backdrop-blur-sm border border-emerald-100 hover:border-emerald-300"
              >
                {/* Header */}
                <div className="bg-linear-to-r from-emerald-500 to-emerald-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/20 rounded-full -mr-12 -mt-12"></div>
                  <div className="relative z-10">
                    <p className="text-sm font-semibold text-emerald-100 mb-2">{project.project_code}</p>
                    <h3 className="text-2xl font-bold leading-tight">{project.name}</h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* Role Badge - Single Role */}
                  <div>
                    <span 
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${getRoleColor(project.user_role)}`}
                    >
                      {project.user_role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* CSR Partner */}
                  <div className="flex items-start gap-3 pt-2">
                    <Briefcase className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">CSR Partner</p>
                      <p className="text-gray-900 font-semibold text-lg">{project.csr_partner_name}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</p>
                      <p className={`font-bold capitalize text-lg ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Duration</p>
                      <p className="text-gray-900 font-medium">
                        {formatDate(project.start_date)} → {formatDate(project.end_date)}
                      </p>
                    </div>
                  </div>

                  {/* Budget */}
                  {project.total_budget && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Budget</p>
                        <p className="text-emerald-600 font-bold text-lg">
                          ₹{project.total_budget.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-100 group-hover:bg-emerald-100 transition">
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="text-emerald-600 font-bold flex items-center gap-2 group-hover:text-emerald-700"
                  >
                    Open Project <span className="text-lg">→</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}