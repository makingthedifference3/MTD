import { useState, useEffect, useCallback } from 'react';
import type { FormEvent, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderKanban, DollarSign, X, MapPin, Calendar, Loader } from 'lucide-react';
import { useFilter } from '../context/useFilter';
import { useAuth } from '../context/useAuth';
import FilterBar from '../components/FilterBar';
import type { Project } from '../services/filterService';
import type { Project as ProjectServiceProject } from '../services/projectsService';
import { projectsService } from '../services/projectsService';
import { getActiveCSRPartners, type CSRPartner } from '../services/csrPartnersService';
import { getTollsByPartnerId, type Toll } from '../services/tollsService';
import {
  addProjectTeamMembers,
  replaceProjectTeamMembers,
  fetchProjectTeamMembers,
  type ProjectTeamMemberWithUser,
  type ProjectTeamRole,
} from '../services/projectTeamMembersService';
import { getAllActiveUsers, type User } from '../services/usersService';
import { IMPACT_METRIC_VISUALS } from '../constants/impactMetricVisuals';
import {
  getImpactMetricValue,
  getMetricLabel,
  IMPACT_METRIC_LABELS,
  PREDEFINED_METRIC_KEYS,
  type ImpactMetricEntry,
  type ImpactMetricKey,
} from '../utils/impactMetrics';

interface TeamMemberFormEntry {
  userId: string;
  role: ProjectTeamRole;
}

interface ProjectFormData {
  name: string;
  projectCode: string;
  description: string;
  csrPartnerId: string;
  tollId: string;
  location: string;
  state: string;
  category: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  totalBudget: string;
  startDate: string;
  expectedEndDate: string;
  directBeneficiaries: string;
  impactMetrics: ImpactMetricEntry[];
  teamMembers: TeamMemberFormEntry[];
}

const createInitialProjectFormState = (): ProjectFormData => ({
  name: '',
  projectCode: '',
  description: '',
  csrPartnerId: '',
  tollId: '',
  location: '',
  state: '',
  category: '',
  status: 'planning',
  totalBudget: '',
  startDate: '',
  expectedEndDate: '',
  directBeneficiaries: '',
  impactMetrics: [],
  teamMembers: [],
});

const formatRoleLabel = (role?: string | null) => {
  if (!role) return 'No role';
  const normalized = role.replace(/_/g, ' ');
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeProjectStatusForForm = (
  status?: string
): ProjectFormData['status'] => {
  const allowedStatuses: ProjectFormData['status'][] = ['planning', 'active', 'on_hold', 'completed'];
  if (!status) return 'planning';
  return allowedStatuses.includes(status as ProjectFormData['status'])
    ? (status as ProjectFormData['status'])
    : 'planning';
};

const mapProjectToFormData = (
  project: Project,
  teamMembers: ProjectTeamMemberWithUser[] = []
): ProjectFormData => {
  const budgetValue = project.total_budget ?? 0;
  const beneficiaries = project.direct_beneficiaries ?? 0;

  return {
    name: project.name,
    projectCode: project.project_code ?? '',
    description: project.description ?? '',
    csrPartnerId: project.csr_partner_id,
    tollId: project.toll_id ?? '',
    location: project.location ?? '',
    state: project.state ?? '',
    category: project.category ?? '',
    status: normalizeProjectStatusForForm(project.status),
    totalBudget: budgetValue ? budgetValue.toString() : '',
    startDate: project.start_date ?? '',
    expectedEndDate: project.expected_end_date ?? '',
    directBeneficiaries: beneficiaries ? beneficiaries.toString() : '',
    impactMetrics: project.impact_metrics ?? [],
    teamMembers: teamMembers.map((member) => ({
      userId: member.user_id,
      role: (member.role ?? 'team_member') as ProjectTeamRole,
    })),
  };
};

const PRIMARY_IMPACT_METRICS: ImpactMetricKey[] = ['meals_served', 'pads_distributed', 'trees_planted'];
const SECONDARY_IMPACT_METRICS: ImpactMetricKey[] = ['students_enrolled', 'schools_renovated'];

const ProjectsPage = () => {
  const { projects, filteredProjects, selectedPartner, selectedProject, refreshData } = useFilter();
  const { currentRole } = useAuth();
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<Project | null>(null);
  const [selectedProjectTeamMembers, setSelectedProjectTeamMembers] = useState<ProjectTeamMemberWithUser[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [teamMembersError, setTeamMembersError] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isPreparingEdit, setIsPreparingEdit] = useState(false);

  // Add project modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>(createInitialProjectFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [csrPartners, setCsrPartners] = useState<CSRPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [tollsLoading, setTollsLoading] = useState(false);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [teamUsersLoading, setTeamUsersLoading] = useState(false);
  const resetFormState = () => {
    setFormData(createInitialProjectFormState());
    setTolls([]);
    setEditingProjectId(null);
  };

  // Fetch CSR partners when modal opens
  const fetchPartners = useCallback(async () => {
    try {
      setPartnersLoading(true);
      const partners = await getActiveCSRPartners();
      setCsrPartners(partners);
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    } finally {
      setPartnersLoading(false);
    }
  }, []);

  // Fetch tolls when CSR partner is selected
  const fetchTolls = useCallback(async (partnerId: string) => {
    if (!partnerId) {
      setTolls([]);
      return;
    }
    try {
      setTollsLoading(true);
      const partnerTolls = await getTollsByPartnerId(partnerId);
      setTolls(partnerTolls);
    } catch (err) {
      console.error('Failed to fetch tolls:', err);
      setTolls([]);
    } finally {
      setTollsLoading(false);
    }
  }, []);

  const fetchTeamUsers = useCallback(async () => {
    try {
      setTeamUsersLoading(true);
      const users = await getAllActiveUsers();
      setTeamUsers(users);
    } catch (err) {
      console.error('Failed to fetch team users:', err);
    } finally {
      setTeamUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAddModalOpen && csrPartners.length === 0) {
      fetchPartners();
    }
    if (isAddModalOpen && teamUsers.length === 0) {
      fetchTeamUsers();
    }
  }, [isAddModalOpen, csrPartners.length, teamUsers.length, fetchPartners, fetchTeamUsers]);

  // Fetch tolls when partner changes and auto-fill location from partner
  useEffect(() => {
    if (formData.csrPartnerId) {
      const selectedPartnerData = csrPartners.find((p) => p.id === formData.csrPartnerId);
      const partnerHasToll = Boolean(selectedPartnerData?.has_toll);

      if (partnerHasToll) {
        fetchTolls(formData.csrPartnerId);
      } else {
        setTolls([]);
      }

      // Reset toll selection and auto-fill location from CSR partner
      setFormData((prev) => ({
        ...prev,
        tollId: '',
        location: selectedPartnerData?.city ?? '',
        state: selectedPartnerData?.state ?? '',
      }));
    } else {
      setTolls([]);
    }
  }, [formData.csrPartnerId, fetchTolls, csrPartners]);

  useEffect(() => {
    if (!selectedProjectDetails) {
      setSelectedProjectTeamMembers([]);
      setTeamMembersError(null);
      setTeamMembersLoading(false);
      return;
    }

    let isMounted = true;

    const loadTeamMembers = async () => {
      if (isMounted) {
        setTeamMembersLoading(true);
        setTeamMembersError(null);
      }

      try {
        const members = await fetchProjectTeamMembers(selectedProjectDetails.id);
        if (isMounted) {
          setSelectedProjectTeamMembers(members);
        }
      } catch (err) {
        console.error('Failed to load project team members:', err);
        if (isMounted) {
          setSelectedProjectTeamMembers([]);
          setTeamMembersError('Unable to load the project team at the moment.');
        }
      } finally {
        if (isMounted) {
          setTeamMembersLoading(false);
        }
      }
    };

    loadTeamMembers();

    return () => {
      isMounted = false;
    };
  }, [selectedProjectDetails]);

  const handleSaveProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.name || !formData.csrPartnerId) {
      setFormError('Please fill in the project name and select a CSR partner.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      let projectId = editingProjectId;

      if (editingProjectId) {
        const updatePayload = buildProjectUpdatePayload(formData);
        await projectsService.updateProject(editingProjectId, updatePayload);
      } else {
        const payload = buildProjectPayload(formData);
        const newProject = await projectsService.createProject(payload);

        if (!newProject?.id) {
          throw new Error('Project created but missing identifier. Please try again.');
        }

        projectId = newProject.id;
      }

      const memberInputs = formData.teamMembers
        .filter((member) => member.userId)
        .map((member) => ({
          project_id: projectId!,
          user_id: member.userId,
          role: member.role,
        }));

      if (editingProjectId) {
        await replaceProjectTeamMembers(projectId!, memberInputs);
      } else if (memberInputs.length) {
        await addProjectTeamMembers(memberInputs);
      }

      setIsAddModalOpen(false);
      setSelectedProjectDetails(null);
      resetFormState();
      if (refreshData) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to save project:', err);
      const message = err instanceof Error ? err.message : 'Unable to save project. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCreateModal = () => {
    resetFormState();
    setFormError(null);
    setSelectedProjectDetails(null);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    if (isSubmitting) return;
    setIsAddModalOpen(false);
    setFormError(null);
    resetFormState();
  };

  const handleEditProject = async (project: Project) => {
    setFormError(null);
    setIsPreparingEdit(true);
    setEditingProjectId(project.id);
    setSelectedProjectDetails(null);
    setFormData(mapProjectToFormData(project));
    setIsAddModalOpen(true);

    try {
      const members = await fetchProjectTeamMembers(project.id);
      setFormData(mapProjectToFormData(project, members));
    } catch (err) {
      console.error('Failed to prepare project for editing:', err);
      setFormError('Unable to load existing team assignments. You can still edit the project and reassign members.');
    } finally {
      setIsPreparingEdit(false);
    }
  };

  const getProjectStatus = (project: Project): 'on-track' | 'completed' => {
    // Map database status values to display status
    if (project.status === 'completed') return 'completed';
    return 'on-track';
  };

  // Use filtered projects: 
  // 1. If a specific project is selected, show only that project
  // 2. If a partner is selected, show projects for that partner
  // 3. Otherwise show all projects
  const displayProjects = selectedProject 
    ? (projects.find(p => p.id === selectedProject) ? [projects.find(p => p.id === selectedProject)!] : [])
    : selectedPartner 
    ? filteredProjects 
    : projects;

  const getStatusColor = (status: 'on-track' | 'completed') => {
    switch (status) {
      case 'on-track':
        return 'bg-emerald-100 text-emerald-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const showTollColumn = Boolean(selectedProjectDetails?.toll || selectedProjectDetails?.toll_id);
  const selectedProjectTollName =
    selectedProjectDetails?.toll?.toll_name ||
    selectedProjectDetails?.toll?.poc_name ||
    (selectedProjectDetails?.toll_id ? 'Linked Toll' : null);

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-2">Manage and track all CSR projects</p>
          </div>
          {currentRole === 'admin' && (
            <button
              onClick={handleOpenCreateModal}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {displayProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <FolderKanban className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.project_code} • {project.location}</p>
                  {project.toll?.toll_name && (
                    <p className="text-xs text-emerald-600 mt-1">Toll: {project.toll.toll_name}</p>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getProjectStatus(project))}`}>
                {getProjectStatus(project).replace('-', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">Budget</p>
                  <p className="text-sm font-semibold text-gray-900">₹{((project.total_budget || 0) / 1000).toFixed(0)}K</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">Utilized</p>
                  <p className="text-sm font-semibold text-gray-900">₹{((project.utilized_budget || 0) / 1000).toFixed(0)}K</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FolderKanban className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">Beneficiaries</p>
                  <p className="text-sm font-semibold text-gray-900">{(project.direct_beneficiaries || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedProjectDetails(project)}
              className="w-full mt-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 rounded-lg transition-colors">
              View Details
            </button>
          </motion.div>
        ))}
      </div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProjectDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedProjectDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedProjectDetails.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getProjectStatus(selectedProjectDetails))}`}>
                      {getProjectStatus(selectedProjectDetails).replace('-', ' ').toUpperCase()}
                    </span>
                    <p className="text-gray-600 text-sm">{selectedProjectDetails.project_code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {currentRole === 'admin' && (
                    <button
                      type="button"
                      onClick={() => handleEditProject(selectedProjectDetails)}
                      disabled={isPreparingEdit}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:bg-emerald-300"
                    >
                      {isPreparingEdit ? 'Preparing...' : 'Edit Project'}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedProjectDetails(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Description */}
                {selectedProjectDetails.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedProjectDetails.description}</p>
                  </div>
                )}

                {/* Location & State */}
                <div className={`grid grid-cols-1 ${showTollColumn ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                  {selectedProjectDetails.location && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Location</p>
                      <p className="text-gray-900 font-medium">{selectedProjectDetails.location}</p>
                    </div>
                  )}
                  {selectedProjectDetails.state && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">State</p>
                      <p className="text-gray-900 font-medium">{selectedProjectDetails.state}</p>
                    </div>
                  )}
                  {showTollColumn && selectedProjectTollName && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Toll / Subcompany</p>
                      <p className="text-gray-900 font-medium">{selectedProjectTollName}</p>
                      {selectedProjectDetails.toll &&
                        [selectedProjectDetails.toll.city, selectedProjectDetails.toll.state].some(Boolean) && (
                        <p className="text-sm text-gray-500">
                          {[selectedProjectDetails.toll.city, selectedProjectDetails.toll.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {!teamMembersLoading && teamMembersError && (
                  <p className="text-sm text-red-500">{teamMembersError}</p>
                )}
                {teamMembersLoading && (
                  <p className="text-sm text-gray-500">Loading team members…</p>
                )}
                {!teamMembersLoading && !teamMembersError && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Project Team</h3>
                      <p className="text-xs text-gray-500">{selectedProjectTeamMembers.length || 0} member{selectedProjectTeamMembers.length === 1 ? '' : 's'}</p>
                    </div>
                    {selectedProjectTeamMembers.length === 0 ? (
                      <p className="text-sm text-gray-500">No team members have been assigned yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {selectedProjectTeamMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {member.user?.full_name ?? 'Team Member'}
                              </p>
                              <p className="text-xs uppercase tracking-wide text-gray-500">
                                {formatRoleLabel(member.role)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Budget & Beneficiaries */}
                <div className="grid grid-cols-3 gap-4 bg-linear-to-r from-emerald-50 to-blue-50 rounded-2xl p-4 border border-emerald-100">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">Total Budget</p>
                    <p className="text-2xl font-bold text-emerald-900">₹{((selectedProjectDetails.total_budget || 0) / 10000000).toFixed(1)}Cr</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Utilized</p>
                    <p className="text-2xl font-bold text-blue-900">₹{((selectedProjectDetails.utilized_budget || 0) / 10000000).toFixed(1)}Cr</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-700 uppercase mb-1">Beneficiaries</p>
                    <p className="text-2xl font-bold text-purple-900">{(selectedProjectDetails.direct_beneficiaries || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Impact Metrics */}
                {PRIMARY_IMPACT_METRICS.some((key) => getImpactMetricValue(selectedProjectDetails.impact_metrics, key) > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PRIMARY_IMPACT_METRICS.map((key) => {
                      const value = getImpactMetricValue(selectedProjectDetails.impact_metrics, key);
                      if (value <= 0) return null;
                      const visual = IMPACT_METRIC_VISUALS[key];
                      const Icon = visual.icon;
                      return (
                        <div key={key} className={`rounded-xl p-4 border ${visual.wrapperClasses}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`${visual.iconWrapperClasses} rounded-xl`}>
                              <Icon className={`w-5 h-5 ${visual.iconClasses}`} />
                            </div>
                            <span className={visual.labelClasses}>{IMPACT_METRIC_LABELS[key]}</span>
                          </div>
                          <p className={visual.valueClasses}>{value.toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Other Metrics */}
                {SECONDARY_IMPACT_METRICS.some((key) => getImpactMetricValue(selectedProjectDetails.impact_metrics, key) > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SECONDARY_IMPACT_METRICS.map((key) => {
                      const value = getImpactMetricValue(selectedProjectDetails.impact_metrics, key);
                      if (value <= 0) return null;
                      const visual = IMPACT_METRIC_VISUALS[key];
                      const Icon = visual.icon;
                      return (
                        <div key={key} className={`rounded-xl p-4 border ${visual.wrapperClasses}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`${visual.iconWrapperClasses} rounded-xl`}>
                              <Icon className={`w-5 h-5 ${visual.iconClasses}`} />
                            </div>
                            <span className={visual.labelClasses}>{IMPACT_METRIC_LABELS[key]}</span>
                          </div>
                          <p className={visual.valueClasses}>{value.toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Custom Metrics */}
                {selectedProjectDetails.impact_metrics?.some((m) => m.key === 'custom' && m.value > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProjectDetails.impact_metrics
                      .filter((m) => m.key === 'custom' && m.value > 0)
                      .map((metric, idx) => (
                        <div key={`custom-${idx}`} className="rounded-xl p-4 border bg-purple-50 border-purple-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-purple-100 rounded-xl">
                              <FolderKanban className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-semibold text-purple-700">{getMetricLabel(metric)}</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">{metric.value.toLocaleString()}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setSelectedProjectDetails(null)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <AddProjectModal
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          formError={formError}
          csrPartners={csrPartners}
          partnersLoading={partnersLoading}
          tolls={tolls}
          tollsLoading={tollsLoading}
          teamUsers={teamUsers}
          teamUsersLoading={teamUsersLoading}
          onClose={handleModalClose}
          onSubmit={handleSaveProject}
          isEditing={Boolean(editingProjectId)}
        />
      )}
    </div>
  );
};

export default ProjectsPage;

// Helper to generate a unique project code
const generateProjectCode = () => {
  const prefix = 'PRJ';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Build payload for creating a new project
const buildProjectPayload = (values: ProjectFormData) => {
  const now = new Date().toISOString();
  const budgetValue = Number(values.totalBudget) || 0;
  const beneficiaries = Number(values.directBeneficiaries) || 0;

  const cleanedMetrics = values.impactMetrics
    .map((metric) => ({
      key: metric.key,
      value: Math.max(0, metric.value || 0),
      customLabel: metric.customLabel,
    }))
    .filter((metric) => metric.key !== 'custom' || metric.customLabel?.trim());

  return {
    project_code: values.projectCode.trim() || generateProjectCode(),
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    csr_partner_id: values.csrPartnerId,
    toll_id: values.tollId || undefined,
    location: values.location.trim() || undefined,
    state: values.state.trim() || undefined,
    category: values.category.trim() || undefined,
    status: values.status,
    start_date: values.startDate || now,
    expected_end_date: values.expectedEndDate || undefined,
    total_budget: budgetValue,
    approved_budget: budgetValue,
    utilized_budget: 0,
    pending_budget: budgetValue,
    direct_beneficiaries: beneficiaries,
    total_beneficiaries: beneficiaries,
    completion_percentage: 0,
    is_active: true,
    impact_metrics: cleanedMetrics,
    created_by: undefined,
    updated_by: undefined,
  };
};

const buildProjectUpdatePayload = (values: ProjectFormData): Partial<ProjectServiceProject> => {
  const budgetValue = values.totalBudget ? Number(values.totalBudget) : undefined;
  const beneficiaries = values.directBeneficiaries ? Number(values.directBeneficiaries) : undefined;

  const cleanedMetrics = values.impactMetrics
    .map((metric) => ({
      key: metric.key,
      value: Math.max(0, metric.value || 0),
      customLabel: metric.customLabel,
    }))
    .filter((metric) => metric.key !== 'custom' || metric.customLabel?.trim());

  const payload: Partial<ProjectServiceProject> = {
    project_code: values.projectCode.trim() || undefined,
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    csr_partner_id: values.csrPartnerId,
    toll_id: values.tollId || undefined,
    location: values.location.trim() || undefined,
    state: values.state.trim() || undefined,
    category: values.category.trim() || undefined,
    status: values.status,
    start_date: values.startDate || undefined,
    expected_end_date: values.expectedEndDate || undefined,
    impact_metrics: cleanedMetrics,
  };

  if (budgetValue !== undefined) {
    payload.total_budget = budgetValue;
  }
  if (beneficiaries !== undefined) {
    payload.direct_beneficiaries = beneficiaries;
  }

  return payload;
};

// Modal props interface
interface AddProjectModalProps {
  formData: ProjectFormData;
  setFormData: Dispatch<SetStateAction<ProjectFormData>>;
  isSubmitting: boolean;
  formError: string | null;
  csrPartners: CSRPartner[];
  partnersLoading: boolean;
  tolls: Toll[];
  tollsLoading: boolean;
  teamUsers: User[];
  teamUsersLoading: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
}

// Add Project Modal component
const AddProjectModal = ({
  formData,
  setFormData,
  isSubmitting,
  formError,
  csrPartners,
  partnersLoading,
  tolls,
  tollsLoading,
  teamUsers,
  teamUsersLoading,
  onClose,
  onSubmit,
  isEditing,
}: AddProjectModalProps) => {
  const [metricNameInput, setMetricNameInput] = useState('');
  const [metricError, setMetricError] = useState('');
  const selectedPartner = csrPartners.find((partner) => partner.id === formData.csrPartnerId);
  const partnerHasTolls = Boolean(selectedPartner?.has_toll);
  const TEAM_ROLE_OPTIONS: Array<{ value: ProjectTeamRole; label: string }> = [
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'team_member', label: 'Team Member' },
  ];

  const handleAddTeamMemberRow = () => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { userId: '', role: 'team_member' }],
    }));
  };

  const handleTeamMemberChange = (index: number, updates: Partial<TeamMemberFormEntry>) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => (i === index ? { ...member, ...updates } : member)),
    }));
  };

  const handleRemoveTeamMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  const deriveImpactMetricKey = (candidate: string): { key: ImpactMetricKey; customLabel?: string } | null => {
    const normalized = candidate.trim().toLowerCase();
    if (!normalized) return null;
    // Try to match predefined labels
    const matchLabel = PREDEFINED_METRIC_KEYS.find(
      (key) => IMPACT_METRIC_LABELS[key].toLowerCase() === normalized
    );
    if (matchLabel) return { key: matchLabel };
    // Try to match predefined keys
    const matchKey = PREDEFINED_METRIC_KEYS.find((key) => key === normalized.replace(/\s+/g, '_'));
    if (matchKey) return { key: matchKey };
    // Allow custom metric with any name
    return { key: 'custom', customLabel: candidate.trim() };
  };

  const handleAddMetricField = () => {
    const result = deriveImpactMetricKey(metricNameInput);
    if (!metricNameInput.trim()) {
      setMetricError('Type a metric name before adding');
      return;
    }
    if (!result) {
      setMetricError('Please enter a valid metric name');
      return;
    }
    // For custom metrics, check if the same custom label already exists
    if (result.key === 'custom') {
      const alreadyExists = formData.impactMetrics.some(
        (metric) => metric.key === 'custom' && metric.customLabel === result.customLabel
      );
      if (alreadyExists) {
        setMetricError('This custom metric is already added');
        return;
      }
    } else {
      // For predefined metrics, check if key already exists
      if (formData.impactMetrics.some((metric) => metric.key === result.key)) {
        setMetricError('Metric already added');
        return;
      }
    }
    setFormData((prev) => ({
      ...prev,
      impactMetrics: [...prev.impactMetrics, { key: result.key, value: 0, customLabel: result.customLabel }],
    }));
    setMetricNameInput('');
    setMetricError('');
  };

  const handleMetricValueChange = (index: number, value: number) => {
    setFormData((prev) => ({
      ...prev,
      impactMetrics: prev.impactMetrics.map((metric, i) =>
        i === index ? { ...metric, value: Math.max(0, value) } : metric
      ),
    }));
  };

  const handleRemoveMetric = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      impactMetrics: prev.impactMetrics.filter((_, i) => i !== index),
    }));
  };

  const handleTollSelection = (tollId: string) => {
    const selectedToll = tolls.find((toll) => toll.id === tollId);
    setFormData((prev) => ({
      ...prev,
      tollId,
      location: selectedToll?.city ?? prev.location,
      state: selectedToll?.state ?? prev.state,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
        <div>
          <p className="text-sm font-medium text-emerald-600">{isEditing ? 'Edit Project' : 'Create New Project'}</p>
          <h3 className="text-2xl font-bold text-gray-900">{isEditing ? 'Update Project' : 'Add Project'}</h3>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close modal">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {/* CSR Partner Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">
            CSR Partner *
            {partnersLoading ? (
              <div className="mt-1 flex items-center gap-2 text-gray-500">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Loading partners...</span>
              </div>
            ) : (
              <select
                value={formData.csrPartnerId}
                onChange={(e) => {
                  const partnerId = e.target.value;
                  const partner = csrPartners.find(p => p.id === partnerId);
                  setFormData((prev) => ({
                    ...prev,
                    csrPartnerId: partnerId,
                    tollId: '', // Reset toll when partner changes
                    // Auto-fill location from CSR partner when no toll
                    location: partner?.city ?? '',
                    state: partner?.state ?? '',
                  }));
                }}
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select a CSR Partner</option>
                {csrPartners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.company_name || partner.name}
                  </option>
                ))}
              </select>
            )}
          </label>

          {/* Toll Selection - Only show if partner has tolls */}
          {formData.csrPartnerId && partnerHasTolls && (
            <label className="text-sm font-medium text-gray-700">
              Toll / Subcompany
              {tollsLoading ? (
                <div className="mt-1 flex items-center gap-2 text-gray-500">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Loading tolls...</span>
                </div>
              ) : tolls.length > 0 ? (
                <select
                  value={formData.tollId}
                  onChange={(e) => handleTollSelection(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">No Toll (Direct Partner)</option>
                  {tolls.map((toll) => (
                    <option key={toll.id} value={toll.id}>
                      {toll.toll_name || toll.poc_name}
                      {toll.city ? ` • ${toll.city}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm">
                  No tolls available for this partner
                </div>
              )}
            </label>
          )}
          {formData.csrPartnerId && !partnerHasTolls && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600">
              This partner does not manage tolls separately. Project location will use the CSR partner's city/state.
            </div>
          )}
        </div>

        {/* Project Name and Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">
            Project Name *
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              required
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Rural Education Initiative"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Project Code
            <input
              type="text"
              value={formData.projectCode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  projectCode: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Auto-generated if empty"
            />
          </label>
        </div>

        {/* Description */}
        <label className="text-sm font-medium text-gray-700 block">
          Description
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows={3}
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            placeholder="Project description..."
          />
        </label>

        {/* Location and State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Location
            </span>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Mumbai"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            State
            <input
              type="text"
              value={formData.state}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  state: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Maharashtra"
            />
          </label>
        </div>

        {/* Category and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">
            Category
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Education, Healthcare, Environment..."
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Status
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                    status: e.target.value as ProjectFormData['status'],
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>

        {/* Team Members Assignment */}
        <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Project Team</p>
              <p className="text-xs text-gray-500">Assign accountants, project managers, and team members</p>
            </div>
            <button
              type="button"
              onClick={handleAddTeamMemberRow}
              disabled={teamUsersLoading || teamUsers.length === 0}
              className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Member
            </button>
          </div>

          {teamUsersLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader className="w-4 h-4 animate-spin" />
              Loading team members...
            </div>
          ) : formData.teamMembers.length === 0 ? (
            teamUsers.length === 0 ? (
              <p className="text-sm text-gray-500">No active users available to assign.</p>
            ) : (
              <p className="text-sm text-gray-500">No members added yet. Click "Add Member" to start building the project team.</p>
            )
          ) : (
            <div className="space-y-3">
              {formData.teamMembers.map((member, index) => (
                <div
                  key={`team-member-${index}`}
                  className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_auto] gap-3 items-end p-3 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <label className="text-sm font-medium text-gray-700">
                    Team Member
                    <select
                      value={member.userId}
                      onChange={(e) => handleTeamMemberChange(index, { userId: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select team member</option>
                      {teamUsers.map((user) => {
                        const disabled = formData.teamMembers.some(
                          (assigned, assignedIndex) => assignedIndex !== index && assigned.userId === user.id
                        );
                        return (
                          <option key={user.id} value={user.id} disabled={disabled}>
                            {user.full_name}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    Role
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleTeamMemberChange(index, { role: e.target.value as ProjectTeamRole })
                      }
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    >
                      {TEAM_ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeamMember(index)}
                    className="h-10 w-full md:w-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100"
                    aria-label="Remove team member"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="mt-3 text-xs text-gray-500">
            Allowed roles: Project Manager, Accountant, Team Member. Add as many members as needed for this project.
          </p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Start Date
            </span>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Expected End Date
            </span>
            <input
              type="date"
              value={formData.expectedEndDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expectedEndDate: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </label>
        </div>

        {/* Budget and Beneficiaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> Total Budget (₹)
            </span>
            <input
              type="number"
              value={formData.totalBudget}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  totalBudget: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="5000000"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Direct Beneficiaries
            <input
              type="number"
              value={formData.directBeneficiaries}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  directBeneficiaries: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="1000"
            />
          </label>
        </div>

        {/* Impact Metrics */}
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-emerald-700">Impact Metrics (Optional)</p>
            <p className="text-xs text-gray-500">
              {formData.impactMetrics.length} selected
            </p>
          </div>

          {formData.impactMetrics.length === 0 ? (
            <p className="text-sm text-gray-500">
              Select the metrics that matter most for this project and record the values.
            </p>
          ) : (
            <div className="space-y-3">
              {formData.impactMetrics.map((metric, index) => (
                <div
                  key={metric.key === 'custom' ? `custom-${index}` : metric.key}
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {getMetricLabel(metric)}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {metric.key === 'custom' ? 'Custom Metric' : metric.key.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      value={metric.value}
                      onChange={(event) =>
                        handleMetricValueChange(
                          index,
                          Number.isNaN(Number(event.target.value))
                            ? 0
                            : Number(event.target.value)
                        )
                      }
                      className="w-32 rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMetric(index)}
                      className="text-xs font-semibold text-red-500 px-3 py-2 rounded-full border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <label htmlFor="impact-metric-input" className="sr-only">
                Metric name
              </label>
              <input
                type="text"
                id="impact-metric-input"
                list="impact-metric-suggestions"
                placeholder="Type any metric name (e.g., Meals Served, Water Bottles, etc.)"
                value={metricNameInput}
                onChange={(event) => setMetricNameInput(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              />
              <datalist id="impact-metric-suggestions">
                {PREDEFINED_METRIC_KEYS.map((key) => (
                  <option key={key} value={IMPACT_METRIC_LABELS[key]} />
                ))}
              </datalist>
              <p className="text-xs text-gray-500 mt-1">
                Choose from suggestions or type any custom metric name
              </p>
              {metricError && (
                <p className="text-xs text-red-500 mt-1">{metricError}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddMetricField}
              className="w-full md:w-auto rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-3 transition-colors disabled:opacity-60"
            >
              Add Metric
            </button>
          </div>
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || partnersLoading}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  </div>
  );
};

