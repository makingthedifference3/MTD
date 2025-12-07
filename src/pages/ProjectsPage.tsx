import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormEvent, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderKanban, DollarSign, X, MapPin, Calendar, Loader, LayoutDashboard, Trash2, Copy } from 'lucide-react';
import { useFilter } from '../context/useFilter';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import FilterBar from '../components/FilterBar';
import type { Project } from '../services/filterService';
import type { Project as ProjectServiceProject } from '../services/projectsService';
import { projectsService } from '../services/projectsService';
import { getActiveCSRPartners, type CSRPartner } from '../services/csrPartnersService';
import { getTollsByPartnerId, type Toll } from '../services/tollsService';
import { formatIndianRupee } from '../utils/currency';
import {
  addProjectTeamMembers,
  replaceProjectTeamMembers,
  fetchProjectTeamMembers,
  getUserRoleInProject,
  type ProjectTeamMemberWithUser,
  type ProjectTeamRole,
} from '../services/projectTeamMembersService';
import {
  createBudgetCategories,
  type BudgetCategoryInput,
} from '../services/budgetCategoriesService';
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
import {
  getAllTeamTemplates,
  createTeamTemplate,
  deleteTeamTemplate,
  type TeamTemplate,
  type CreateTeamTemplateInput,
} from '../services/teamTemplatesService';
import { BENEFICIARY_TYPES } from '../constants/beneficiaryTypes';
import { INDIAN_STATES } from '../constants/indianStates';
import { WORK_TYPE_OPTIONS } from '../constants/projectOptions';

const PROJECT_NAME_OPTIONS = [
  'Shoonya',
  'Lajja',
  'Lajja - Naari Shakti Niketan',
  'Lake Restoration',
  'Gyandaan',
  'Construction',
  'Road Safety',
  'Roshni',
  'Traffic Park',
] as const;

interface TeamMemberFormEntry {
  userId: string;
  role: ProjectTeamRole;
}

interface BudgetCategoryFormEntry {
  id: string;
  name: string;
  allocated_amount: string;
  parent_id: string | null;
  children: BudgetCategoryFormEntry[];
}

interface ProjectFormData {
  name: string;
  projectCode: string;
  description: string;
  csrPartnerId: string;
  tollId: string;
  location: string;
  state: string;
  isCustomState: boolean;
  work: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  totalBudget: string;
  startDate: string;
  expectedEndDate: string;
  directBeneficiaries: string;
  beneficiaryType: string;
  projectNameIsCustom: boolean;
  createBeneficiaryProjects: boolean;
  impactMetrics: ImpactMetricEntry[];
  teamMembers: TeamMemberFormEntry[];
  enableBudgetCategories: boolean;
  budgetCategories: BudgetCategoryFormEntry[];
  uc_link: string;
  fundingPartner: string;
  isCustomFundingPartner: boolean;
}
const createInitialProjectFormState = (): ProjectFormData => ({
  name: '',
  projectCode: '',
  description: '',
  csrPartnerId: '',
  tollId: '',
  location: '',
  state: '',
  isCustomState: false,
  work: '',
  status: 'planning',
  totalBudget: '',
  startDate: '',
  expectedEndDate: '',
  directBeneficiaries: '',
  beneficiaryType: 'Direct Beneficiaries',
  projectNameIsCustom: false,
  createBeneficiaryProjects: false,
  impactMetrics: [],
  teamMembers: [],
  enableBudgetCategories: false,
  budgetCategories: [],
  uc_link: '',
  fundingPartner: '',
  isCustomFundingPartner: false,
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
  const projectMetadataWithName = project as {
    metadata?: { beneficiary_name?: string; beneficiary_type?: string };
  };
  const projectBeneficiaryType =
    project.beneficiary_type || projectMetadataWithName.metadata?.beneficiary_type || 'Direct Beneficiaries';
  const projectState = project.state ?? '';
  const stateIsCustom = Boolean(projectState && !INDIAN_STATES.includes(projectState as typeof INDIAN_STATES[number]));
  const projectNameIsCustom = !PROJECT_NAME_OPTIONS.includes(project.name as typeof PROJECT_NAME_OPTIONS[number]);

  return {
    name: project.name,
    projectCode: project.project_code ?? '',
    description: project.description ?? '',
    csrPartnerId: project.csr_partner_id,
    tollId: project.toll_id ?? '',
    location: project.location ?? '',
    state: projectState,
    isCustomState: stateIsCustom,
    work: project.work ?? project.category ?? '',
    status: normalizeProjectStatusForForm(project.status),
    totalBudget: budgetValue ? budgetValue.toString() : '',
    startDate: project.start_date ?? '',
    expectedEndDate: project.expected_end_date ?? '',
    directBeneficiaries: beneficiaries ? beneficiaries.toString() : '',
    beneficiaryType: projectBeneficiaryType,
    projectNameIsCustom,
    createBeneficiaryProjects: false,
    impactMetrics: project.impact_metrics ?? [],
    teamMembers: teamMembers.map((member) => ({
      userId: member.user_id,
      role: (member.role ?? 'team_member') as ProjectTeamRole,
    })),
    enableBudgetCategories: false, // Will be loaded separately
    budgetCategories: [], // Will be loaded separately
    uc_link: (project as any).uc_link ?? '',
    fundingPartner: (project as any).funding_partner ?? '',
    isCustomFundingPartner: false,
  };
};

const PRIMARY_IMPACT_METRICS: ImpactMetricKey[] = ['meals_served', 'pads_distributed', 'trees_planted'];
const SECONDARY_IMPACT_METRICS: ImpactMetricKey[] = ['students_enrolled', 'schools_renovated'];

// Import Project type from projectsService for sub-projects
import type { Project as ServiceProject } from '../services/projectsService';

const ProjectsPage = () => {
  const { projects, filteredProjects, selectedPartner, selectedToll, selectedProject, refreshData, setSelectedPartner, setSelectedProject, setSelectedToll } = useFilter();
  const { currentRole, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Get effective role from project context for non-admin users
  const getEffectiveRole = () => {
    // Admin always uses role from users table
    if (currentRole === 'admin' || currentRole === 'accountant') {
      return currentRole;
    }
    
    // For non-admin users, use role from project context
    const projectContextStr = localStorage.getItem('projectContext');
    if (projectContextStr) {
      try {
        const projectContext = JSON.parse(projectContextStr);
        if (projectContext.projectRole) {
          const normalized = projectContext.projectRole.toLowerCase().trim().replace(/\s+/g, '_');
          return normalized;
        }
      } catch (error) {
        console.error('Error parsing project context:', error);
      }
    }
    
    // Fallback to currentRole from users table
    return currentRole;
  };
  
  const effectiveRole = getEffectiveRole();
  
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<Project | null>(null);
  const [selectedProjectTeamMembers, setSelectedProjectTeamMembers] = useState<ProjectTeamMemberWithUser[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [teamMembersError, setTeamMembersError] = useState<string | null>(null);
  const [subProjects, setSubProjects] = useState<ServiceProject[]>([]);
  const [subProjectsLoading, setSubProjectsLoading] = useState(false);
  const [selectedSubProject, setSelectedSubProject] = useState<ServiceProject | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isPreparingEdit, setIsPreparingEdit] = useState(false);
  const [workFilter, setWorkFilter] = useState<string>('');

  // Sub-project impact metrics editing state
  const [isEditingSubProjectMetrics, setIsEditingSubProjectMetrics] = useState(false);
  const [subProjectMetricsForm, setSubProjectMetricsForm] = useState<ImpactMetricEntry[]>([]);
  const [isSubmittingSubProjectMetrics, setIsSubmittingSubProjectMetrics] = useState(false);
  const [customMetricName, setCustomMetricName] = useState('');
  const [isEditingImpactMetrics, setIsEditingImpactMetrics] = useState(false);
  const [impactMetricsForm, setImpactMetricsForm] = useState<ImpactMetricEntry[]>([]);
  const [isSubmittingImpactMetrics, setIsSubmittingImpactMetrics] = useState(false);
  const [projectCustomMetricName, setProjectCustomMetricName] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [projectDeleteError, setProjectDeleteError] = useState<string | null>(null);

  // Add project modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ucFile, setUcFile] = useState<File | null>(null);
  const [uploadingUcFile, setUploadingUcFile] = useState(false);
  const [teamTemplates, setTeamTemplates] = useState<TeamTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [showManageTemplatesModal, setShowManageTemplatesModal] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>(createInitialProjectFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [csrPartners, setCsrPartners] = useState<CSRPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [tollsLoading, setTollsLoading] = useState(false);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [teamUsersLoading, setTeamUsersLoading] = useState(false);
  
  // Budget categories state for view details
  const [projectBudgetCategories, setProjectBudgetCategories] = useState<any[]>([]);
  const [budgetCategoriesLoading, setBudgetCategoriesLoading] = useState(false);
  
  const resetFormState = () => {
    setFormData(createInitialProjectFormState());
    setTolls([]);
    setEditingProjectId(null);
    setSkipPartnerChangeEffect(false);
  };

  const [skipPartnerChangeEffect, setSkipPartnerChangeEffect] = useState(false);

  const selectedProjectMetadata = (selectedProjectDetails as Project & {
    metadata?: { beneficiary_name?: string; beneficiary_type?: string };
  })?.metadata;
  const selectedProjectBeneficiaryName =
    selectedProjectDetails?.beneficiary_name || selectedProjectMetadata?.beneficiary_name;
  const selectedProjectBeneficiaryLabel =
    selectedProjectDetails?.beneficiary_type || selectedProjectMetadata?.beneficiary_type || 'Beneficiaries';
  const selectedProjectBeneficiaryCount = selectedProjectDetails?.direct_beneficiaries ?? 0;
  const selectedProjectBeneficiaryDisplayValue =
    selectedProjectBeneficiaryName || selectedProjectBeneficiaryCount.toLocaleString();

  const selectedSubProjectBeneficiaryLabel =
    selectedProjectDetails?.beneficiary_type || selectedProjectDetails?.beneficiary_name || selectedProjectBeneficiaryLabel || 'Beneficiaries';
  const selectedSubProjectBeneficiaryCount = selectedSubProject?.direct_beneficiaries ?? 0;

  useEffect(() => {
    if (selectedProjectDetails) {
      setImpactMetricsForm(
        (selectedProjectDetails.impact_metrics || []).map((metric) => ({
          ...metric,
          value: metric.value ?? 0,
        }))
      );
      
      // Load budget categories
      const loadBudgetCategories = async () => {
        try {
          setBudgetCategoriesLoading(true);
          const { getBudgetCategoriesByProject } = await import('../services/budgetCategoriesService');
          const categories = await getBudgetCategoriesByProject(selectedProjectDetails.id);
          setProjectBudgetCategories(categories);
        } catch (error) {
          console.error('Error loading budget categories:', error);
          setProjectBudgetCategories([]);
        } finally {
          setBudgetCategoriesLoading(false);
        }
      };
      
      loadBudgetCategories();
    } else {
      setImpactMetricsForm([]);
      setProjectBudgetCategories([]);
    }
    setIsEditingImpactMetrics(false);
    setProjectCustomMetricName('');
    setIsSubmittingImpactMetrics(false);
  }, [selectedProjectDetails]);

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

  const loadTeamTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const templates = await getAllTeamTemplates();
      setTeamTemplates(templates);
    } catch (error) {
      console.error('Error loading team templates:', error);
    } finally {
      setTemplatesLoading(false);
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

  // Load team templates on mount
  useEffect(() => {
    loadTeamTemplates();
  }, [loadTeamTemplates]);

  // Fetch tolls when partner changes and auto-fill location from partner
  useEffect(() => {
    // Skip the partner change effect when editing to preserve existing toll/location
    if (skipPartnerChangeEffect) {
      setSkipPartnerChangeEffect(false);
      return;
    }

    if (formData.csrPartnerId) {
      const selectedPartnerData = csrPartners.find((p) => p.id === formData.csrPartnerId);
      const partnerHasToll = Boolean(selectedPartnerData?.has_toll);

      if (partnerHasToll) {
        fetchTolls(formData.csrPartnerId);
      } else {
        setTolls([]);
      }

      // Reset toll selection and auto-fill location from CSR partner
      const partnerState = selectedPartnerData?.state ?? '';
      setFormData((prev) => ({
        ...prev,
        tollId: '',
        location: selectedPartnerData?.city ?? '',
        state: partnerState,
        isCustomState: Boolean(partnerState && !INDIAN_STATES.includes(partnerState as typeof INDIAN_STATES[number])),
      }));
    } else {
      setTolls([]);
    }
  }, [formData.csrPartnerId, fetchTolls, csrPartners, skipPartnerChangeEffect]);

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
        console.log('Loading team members for project:', selectedProjectDetails.id);
        const members = await fetchProjectTeamMembers(selectedProjectDetails.id);
        console.log('Loaded team members:', members);
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

  // Load sub-projects when viewing project details
  useEffect(() => {
    if (!selectedProjectDetails) {
      setSubProjects([]);
      return;
    }

    let isMounted = true;

    const loadSubProjects = async () => {
      try {
        setSubProjectsLoading(true);
        const projectSubProjects = await projectsService.getSubProjects(selectedProjectDetails.id);
        if (isMounted) {
          setSubProjects(projectSubProjects);
          console.log('Sub-projects loaded:', projectSubProjects);
        }
      } catch (error) {
        console.error('Error loading sub-projects:', error);
        if (isMounted) {
          setSubProjects([]);
        }
      } finally {
        if (isMounted) {
          setSubProjectsLoading(false);
        }
      }
    };

    loadSubProjects();

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

    // Handle UC file upload if present
    let ucLinkToSave = formData.uc_link;
    if (ucFile) {
      setUploadingUcFile(true);
      try {
        const fileExt = ucFile.name.split('.').pop();
        const projectCode = formData.projectCode || `PRJ-${Date.now()}`;
        const timestamp = Date.now();
        const fileName = `UC_${projectCode}_${timestamp}.${fileExt}`;
        const filePath = `UC/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('MTD_Bills')
          .upload(filePath, ucFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('UC upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('MTD_Bills')
          .getPublicUrl(filePath);

        ucLinkToSave = urlData.publicUrl;
        console.log('UC uploaded successfully. Public URL:', ucLinkToSave);
      } catch (error) {
        console.error('Error uploading UC file:', error);
        setFormError('Failed to upload UC document. Please try again.');
        setUploadingUcFile(false);
        return;
      } finally {
        setUploadingUcFile(false);
      }
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      let projectId = editingProjectId;

      if (editingProjectId) {
        const updatePayload = buildProjectUpdatePayload(formData, ucLinkToSave);
        console.log('Updating project with UC link:', ucLinkToSave);
        console.log('Update payload:', updatePayload);
        await projectsService.updateProject(editingProjectId, updatePayload);
      } else {
        const payload = buildProjectPayload(formData, ucLinkToSave);
        console.log('Creating project with UC link:', ucLinkToSave);
        console.log('Create payload:', payload);
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

      // Handle budget categories
      if (formData.enableBudgetCategories && projectId && formData.budgetCategories.length > 0) {
        if (editingProjectId) {
          // When editing, delete all existing categories and recreate them
          const { getBudgetCategoriesByProject, deleteBudgetCategory } = await import('../services/budgetCategoriesService');
          const existingCategories = await getBudgetCategoriesByProject(projectId);
          
          // Delete all root categories (children will cascade delete)
          const rootCategories = existingCategories.filter(cat => cat.parent_id === null);
          for (const cat of rootCategories) {
            await deleteBudgetCategory(cat.id);
          }
          
          // Create new categories
          await saveBudgetCategories(projectId, formData.budgetCategories, currentUser?.id);
        } else {
          // When creating new project, just create categories
          await saveBudgetCategories(projectId, formData.budgetCategories, currentUser?.id);
        }
      } else if (editingProjectId && !formData.enableBudgetCategories && projectId) {
        // If categories were disabled during edit, delete all existing categories
        const { getBudgetCategoriesByProject, deleteBudgetCategory } = await import('../services/budgetCategoriesService');
        const existingCategories = await getBudgetCategoriesByProject(projectId);
        const rootCategories = existingCategories.filter(cat => cat.parent_id === null);
        for (const cat of rootCategories) {
          await deleteBudgetCategory(cat.id);
        }
      }

      // Create beneficiary sub-projects if checkbox was checked
      if (!editingProjectId && formData.createBeneficiaryProjects && projectId) {
        const beneficiaryCount = Number(formData.directBeneficiaries) || 0;
        if (beneficiaryCount > 0) {
          // Fetch the created project to pass to sub-project creation
          const createdProject = await projectsService.getProjectById(projectId);
          if (createdProject) {
            await projectsService.createBeneficiarySubProjects(createdProject, beneficiaryCount);
          }
        }
      }

      setIsAddModalOpen(false);

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
    setUcFile(null);
    resetFormState();
  };

  const handleEditProject = async (project: Project) => {
    console.log('Editing project:', project.id, project.name);
    console.log('Project UC Link:', (project as any).uc_link);
    console.log('Full project data:', project);
    setFormError(null);
    setIsPreparingEdit(true);
    setEditingProjectId(project.id);
    setSelectedProjectDetails(null);
    
    // Mark to skip the partner change effect so we don't reset toll/location
    setSkipPartnerChangeEffect(true);
    setFormData(mapProjectToFormData(project));
    setIsAddModalOpen(true);

    // Load tolls for the project's partner if there's a toll_id
    if (project.csr_partner_id) {
      fetchTolls(project.csr_partner_id);
    }

    try {
      console.log('Fetching team members for project:', project.id);
      const members = await fetchProjectTeamMembers(project.id);
      console.log('Fetched team members for edit:', members);
      
      // Fetch budget categories if they exist
      const { getBudgetCategoriesByProject } = await import('../services/budgetCategoriesService');
      const budgetCategories = await getBudgetCategoriesByProject(project.id);
      console.log('Fetched budget categories for edit:', budgetCategories);
      
      // Convert budget categories to form format with temporary IDs
      const convertToFormEntries = (categories: any[], parentId: string | null = null): BudgetCategoryFormEntry[] => {
        return categories
          .filter((cat) => cat.parent_id === parentId)
          .map((cat) => ({
            id: cat.id, // Use database ID for existing categories
            name: cat.name,
            allocated_amount: cat.allocated_amount.toString(),
            parent_id: cat.parent_id,
            children: convertToFormEntries(categories, cat.id),
          }));
      };
      
      const formBudgetCategories = convertToFormEntries(budgetCategories);
      
      setFormData((prev) => ({
        ...prev,
        teamMembers: members.map((member) => ({
          userId: member.user_id,
          role: (member.role ?? 'team_member') as ProjectTeamRole,
        })),
        enableBudgetCategories: formBudgetCategories.length > 0,
        budgetCategories: formBudgetCategories,
      }));
    } catch (err) {
      console.error('Failed to prepare project for editing:', err);
      setFormError('Unable to load existing team assignments. You can still edit the project and reassign members.');
    } finally {
      setIsPreparingEdit(false);
    }
  };

  const openProjectDeleteModal = (project: Project) => {
    if (isDeletingProject) return;
    setProjectDeleteError(null);
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const closeProjectDeleteModal = () => {
    if (isDeletingProject) return;
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
    setProjectDeleteError(null);
  };

  const confirmProjectDelete = async () => {
    if (!projectToDelete) return;
    setIsDeletingProject(true);
    setProjectDeleteError(null);

    try {
      const success = await projectsService.deleteProject(projectToDelete.id);
      if (!success) {
        setProjectDeleteError('Unable to delete project.');
        return;
      }

      if (selectedProjectDetails?.id === projectToDelete.id) {
        setSelectedProjectDetails(null);
      }

      setSelectedProject?.(null);

      if (refreshData) {
        await refreshData();
      }

      closeProjectDeleteModal();
    } catch (err) {
      console.error('Failed to delete project:', err);
      setProjectDeleteError('Unable to delete project.');
    } finally {
      setIsDeletingProject(false);
    }
  };

  const getProjectStatus = (project: Project): 'on-track' | 'completed' => {
    // Map database status values to display status
    if (project.status === 'completed') return 'completed';
    return 'on-track';
  };

  // Handler to start editing sub-project impact metrics
  const handleStartEditSubProjectMetrics = () => {
    if (!selectedSubProject) return;
    setSubProjectMetricsForm(selectedSubProject.impact_metrics || []);
    setIsEditingSubProjectMetrics(true);
  };

  // Handler to save sub-project impact metrics
  const handleSaveSubProjectMetrics = async () => {
    if (!selectedSubProject) return;
    
    try {
      setIsSubmittingSubProjectMetrics(true);
      const updatedProject = await projectsService.updateSubProjectImpactMetrics(
        selectedSubProject.id,
        subProjectMetricsForm
      );
      
      // Update the selectedSubProject with new data
      setSelectedSubProject(updatedProject);
      
      // Also update in the subProjects list
      setSubProjects(prev => prev.map(sp => 
        sp.id === updatedProject.id ? updatedProject : sp
      ));
      
      setIsEditingSubProjectMetrics(false);
    } catch (error) {
      console.error('Failed to save sub-project metrics:', error);
    } finally {
      setIsSubmittingSubProjectMetrics(false);
    }
  };

  // Handler to add a new metric to sub-project form
  const handleAddSubProjectMetric = (key: string) => {
    if (key === 'custom') return; // Custom metrics are added via handleAddCustomMetric
    const existingMetric = subProjectMetricsForm.find(m => m.key === key);
    if (!existingMetric) {
      setSubProjectMetricsForm(prev => [...prev, { key: key as ImpactMetricKey, value: 0 }]);
    }
  };

  // Handler to add a custom metric with custom label
  const handleAddCustomMetric = () => {
    if (!customMetricName.trim()) return;
    setSubProjectMetricsForm(prev => [...prev, { 
      key: 'custom' as ImpactMetricKey, 
      value: 0, 
      customLabel: customMetricName.trim() 
    }]);
    setCustomMetricName('');
  };

  // Handler to update a metric value in sub-project form
  const handleUpdateSubProjectMetricValue = (key: string, value: number, customLabel?: string) => {
    setSubProjectMetricsForm(prev => 
      prev.map(m => {
        // For custom metrics, match by customLabel too
        if (key === 'custom' && customLabel) {
          return (m.key === 'custom' && m.customLabel === customLabel) ? { ...m, value } : m;
        }
        return m.key === key ? { ...m, value } : m;
      })
    );
  };

  // Handler to remove a metric from sub-project form
  const handleRemoveSubProjectMetric = (key: string, customLabel?: string) => {
    setSubProjectMetricsForm(prev => prev.filter(m => {
      // For custom metrics, match by customLabel too
      if (key === 'custom' && customLabel) {
        return !(m.key === 'custom' && m.customLabel === customLabel);
      }
      return m.key !== key;
    }));
  };

  // Main project impact metrics editing handlers
  const handleStartEditImpactMetrics = () => {
    if (!selectedProjectDetails) return;
    setImpactMetricsForm(
      (selectedProjectDetails.impact_metrics || []).map((metric) => ({
        ...metric,
        value: metric.value ?? 0,
      }))
    );
    setIsEditingImpactMetrics(true);
  };

  const handleCancelImpactMetricsEdit = () => {
    setImpactMetricsForm(
      (selectedProjectDetails?.impact_metrics || []).map((metric) => ({
        ...metric,
        value: metric.value ?? 0,
      }))
    );
    setProjectCustomMetricName('');
    setIsEditingImpactMetrics(false);
  };

  const handleSaveImpactMetrics = async () => {
    if (!selectedProjectDetails) return;

    try {
      setIsSubmittingImpactMetrics(true);
      const updatedProject = await projectsService.updateProject(selectedProjectDetails.id, {
        impact_metrics: impactMetricsForm,
      });

      if (updatedProject) {
        setSelectedProjectDetails((prev) =>
          prev ? { ...prev, impact_metrics: updatedProject.impact_metrics || [] } : prev
        );
        await refreshData();
      }

      setIsEditingImpactMetrics(false);
    } catch (error) {
      console.error('Failed to save project impact metrics:', error);
    } finally {
      setIsSubmittingImpactMetrics(false);
    }
  };

  const handleAddImpactMetric = (key: string) => {
    if (!key || key === 'custom') return;
    setImpactMetricsForm((prev) => {
      if (prev.some((metric) => metric.key === key)) {
        return prev;
      }
      return [...prev, { key: key as ImpactMetricKey, value: 0 }];
    });
  };

  const handleAddProjectCustomMetric = () => {
    const trimmed = projectCustomMetricName.trim();
    if (!trimmed) return;

    setImpactMetricsForm((prev) => {
      const exists = prev.some(
        (metric) => metric.key === 'custom' && metric.customLabel?.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) {
        return prev;
      }
      return [...prev, { key: 'custom' as ImpactMetricKey, value: 0, customLabel: trimmed }];
    });
    setProjectCustomMetricName('');
  };

  const handleUpdateImpactMetricValue = (key: string, value: number, customLabel?: string) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    setImpactMetricsForm((prev) =>
      prev.map((metric) => {
        if (key === 'custom' && customLabel) {
          return metric.key === 'custom' && metric.customLabel === customLabel
            ? { ...metric, value: safeValue }
            : metric;
        }
        return metric.key === key ? { ...metric, value: safeValue } : metric;
      })
    );
  };

  const handleRemoveImpactMetric = (key: string, customLabel?: string) => {
    setImpactMetricsForm((prev) =>
      prev.filter((metric) => {
        if (key === 'custom' && customLabel) {
          return !(metric.key === 'custom' && metric.customLabel === customLabel);
        }
        return metric.key !== key;
      })
    );
  };

  // Save budget categories recursively
  const saveBudgetCategories = async (
    projectId: string,
    categories: BudgetCategoryFormEntry[],
    userId?: string,
    parentId: string | null = null
  ): Promise<void> => {
    for (const category of categories) {
      const categoryInput: BudgetCategoryInput = {
        project_id: projectId,
        parent_id: parentId,
        name: category.name.trim(),
        allocated_amount: Number(category.allocated_amount) || 0,
        created_by: userId,
      };

      const createdCategory = await createBudgetCategories([categoryInput]);
      
      // If this category has children, save them recursively
      if (category.children && category.children.length > 0) {
        await saveBudgetCategories(projectId, category.children, userId, createdCategory[0].id);
      }
    }
  };

  // Handle viewing project dashboard
  // Handle duplicating a project
  const handleDuplicateProject = async (project: Project) => {
    if (!currentUser) return;

    try {
      // Fetch team members for the project to duplicate
      const teamMembers = await fetchProjectTeamMembers(project.id);

      // Map project data to form, but modify key fields for duplication
      const duplicatedFormData = mapProjectToFormData(project, teamMembers);
      
      // Modify for duplicate:
      // - Clear project code (will auto-generate new one)
      // - Add "(Copy)" to project name
      // - Reset some fields
      duplicatedFormData.projectCode = ''; // Will auto-generate
      duplicatedFormData.name = `${project.name} (Copy)`;
      duplicatedFormData.startDate = ''; // User should set new dates
      duplicatedFormData.expectedEndDate = '';
      duplicatedFormData.createBeneficiaryProjects = false; // Don't auto-create for duplicate
      
      setFormData(duplicatedFormData);
      setEditingProjectId(null); // Not editing, creating new
      setIsAddModalOpen(true);
    } catch (error) {
      console.error('Error preparing project duplication:', error);
      alert('Failed to prepare project duplication. Please try again.');
    }
  };

  // Handle loading a team template
  const handleLoadTemplate = (templateId: string) => {
    const template = teamTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const templateMembers = template.members.map((member) => ({
      userId: member.user_id,
      role: member.role,
    }));

    setFormData((prev) => ({
      ...prev,
      teamMembers: templateMembers,
    }));
  };

  // Handle saving current team members as a template
  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (formData.teamMembers.length === 0) {
      alert('Please add at least one team member before saving template');
      return;
    }

    // Filter out empty team member rows
    const validMembers = formData.teamMembers.filter((m) => m.userId);
    if (validMembers.length === 0) {
      alert('Please select users for team members before saving template');
      return;
    }

    try {
      const input: CreateTeamTemplateInput = {
        name: newTemplateName.trim(),
        description: newTemplateDescription.trim() || undefined,
        members: validMembers.map((m) => ({
          user_id: m.userId,
          role: m.role,
        })),
        created_by: currentUser?.id,
      };

      await createTeamTemplate(input);
      await loadTeamTemplates();
      setShowSaveTemplateModal(false);
      setNewTemplateName('');
      setNewTemplateDescription('');
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  // Handle deleting a template
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await deleteTeamTemplate(templateId);
      await loadTeamTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleViewProjectDashboard = async (project: Project) => {
    if (!currentUser) return;

    try {
      // Get user's role in this project
      const userRole = currentRole === 'admin' 
        ? 'admin' 
        : await getUserRoleInProject(currentUser.id, project.id);

      console.log('User role in project:', userRole);
      console.log('Current role from auth:', currentRole);

      if (!userRole && currentRole !== 'admin') {
        alert('You are not assigned to this project');
        return;
      }

      // Normalize role to lowercase with underscores (e.g., "Project Manager" -> "project_manager")
      const normalizedRole = userRole?.toLowerCase().replace(/\s+/g, '_') || 'team_member';
      console.log('Normalized role:', normalizedRole);

      // Store project context in localStorage for dashboard to pick up
      localStorage.setItem('projectContext', JSON.stringify({
        projectId: project.id,
        partnerId: project.csr_partner_id,
        tollId: project.toll_id,
        projectRole: normalizedRole,
      }));

      // Set filters and lock them
      setSelectedPartner(project.csr_partner_id);
      if (project.toll_id) {
        setSelectedToll(project.toll_id);
      }
      setSelectedProject(project.id);

      // Navigate to appropriate dashboard based on role
      const roleRouteMap: Record<string, string> = {
        'admin': '/admin-dashboard',
        'project_manager': '/pm-dashboard',
        'accountant': '/accountant-dashboard',
        'team_member': '/team-member-dashboard',
      };

      const route = roleRouteMap[normalizedRole] || '/team-member-dashboard';
      console.log('Navigating to route:', route, 'for normalized role:', normalizedRole);
      navigate(route);
    } catch (error) {
      console.error('Error viewing project dashboard:', error);
      alert('Failed to open project dashboard');
    }
  };

  // Get unique work values for filter dropdown
  const uniqueWorkValues = useMemo(() => {
    const workSet = new Set<string>();
    projects.forEach(project => {
      if (project.work) {
        workSet.add(project.work);
      }
    });
    return Array.from(workSet).sort();
  }, [projects]);

  // Compose aggregated custom metrics (main + beneficiary sub-projects)
  const aggregatedCustomMetrics = useMemo(() => {
    const totals = new Map<string, number>();

    const addMetrics = (metrics?: ImpactMetricEntry[]) => {
      metrics
        ?.filter((metric) => metric.key === 'custom' && metric.customLabel && metric.value > 0)
        .forEach((metric) => {
          const label = metric.customLabel!.trim();
          if (!label) return;
          const existing = totals.get(label) ?? 0;
          totals.set(label, existing + metric.value);
        });
    };

    addMetrics(selectedProjectDetails?.impact_metrics);
    subProjects.forEach((sub) => addMetrics(sub.impact_metrics));

    return Array.from(totals.entries())
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({ label, value }));
  }, [selectedProjectDetails?.impact_metrics, subProjects]);

  const aggregatedImpactMetrics = useMemo(() => {
    const combined = [
      ...(selectedProjectDetails?.impact_metrics || []),
      ...subProjects.flatMap((sub) => sub.impact_metrics || []),
    ];
    const accumulator = new Map<string, ImpactMetricEntry>();
    combined.forEach((metric) => {
      const key = metric.key === 'custom' ? `custom:${metric.customLabel ?? ''}` : metric.key;
      const previous = accumulator.get(key);
      const value = Math.max(0, metric.value || 0);
      if (metric.key === 'custom') {
        const customLabel = metric.customLabel?.trim();
        if (!customLabel) return;
        const existingValue = previous?.value ?? 0;
        accumulator.set(key, {
          key: 'custom',
          customLabel,
          value: existingValue + value,
        });
      } else {
        const existingValue = previous?.value ?? 0;
        accumulator.set(key, {
          key: metric.key as ImpactMetricKey,
          value: existingValue + value,
        });
      }
    });
    return Array.from(accumulator.values()).filter((metric) => metric.value > 0);
  }, [selectedProjectDetails?.impact_metrics, subProjects]);

  const impactMetricFlags = useMemo(() => {
    const metrics = aggregatedImpactMetrics;
    const hasPrimary = PRIMARY_IMPACT_METRICS.some(
      (key) => getImpactMetricValue(metrics, key) > 0
    );
    const hasSecondary = SECONDARY_IMPACT_METRICS.some(
      (key) => getImpactMetricValue(metrics, key) > 0
    );
    const hasCustom = (metrics || []).some(
      (metric) => metric.key === 'custom' && metric.customLabel && metric.value > 0
    );

    return {
      hasPrimary,
      hasSecondary,
      hasCustom,
      hasAny: hasPrimary || hasSecondary || hasCustom,
    };
  }, [aggregatedImpactMetrics]);

  // Use filtered projects: 
  // 1. If a specific project is selected, show only that project
  // 2. If a partner is selected, show projects for that partner
  // 3. Otherwise show all projects
  // 4. Apply work filter if set
  const displayProjects: Project[] = useMemo(() => {
    // Respect filters even when they produce zero results; only fall back to all projects when no filters are active.
    const hasActiveFilters = Boolean(selectedPartner || selectedToll || selectedProject);

    let projectList: Project[] = [];

    if (selectedProject) {
      const match = projects.find((p) => p.id === selectedProject);
      projectList = match ? [match] : [];
    } else if (hasActiveFilters) {
      projectList = filteredProjects;
    } else {
      projectList = projects;
    }

    // Apply work filter
    if (workFilter) {
      projectList = projectList.filter((p) => p.work === workFilter);
    }

    // Sort by project_code in ascending order
    projectList = projectList.sort((a, b) => {
      const codeA = a.project_code || '';
      const codeB = b.project_code || '';
      return codeA.localeCompare(codeB);
    });

    return projectList;
  }, [selectedProject, selectedPartner, selectedToll, filteredProjects, projects, workFilter]);

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

  const { isLoading } = useFilter();

  if (isLoading) {
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
          {effectiveRole === 'admin' && (
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
      <FilterBar
        workFilter={workFilter}
        onWorkFilterChange={setWorkFilter}
        workOptions={uniqueWorkValues}
      />

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {displayProjects.map((project, index) => {
          const isCurrentDeleting = isDeletingProject && projectToDelete?.id === project.id;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
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
                      <p className="text-xs text-emerald-600 mt-1">Subcompany: {project.toll.toll_name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getProjectStatus(project))}`}>
                    {getProjectStatus(project).replace('-', ' ').toUpperCase()}
                  </span>
                  {effectiveRole === 'admin' && (
                    <button
                      onClick={() => openProjectDeleteModal(project)}
                      disabled={isCurrentDeleting}
                      className="px-3 py-2 rounded-lg text-sm flex items-center gap-1 border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-600">Budget</p>
                    <p className="text-sm font-semibold text-gray-900">{formatIndianRupee(project.total_budget ?? 0)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-600">Utilized</p>
                    <p className="text-sm font-semibold text-gray-900">{formatIndianRupee(project.utilized_budget ?? 0)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FolderKanban className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-600">{project.beneficiary_type || (project as { metadata?: { beneficiary_type?: string } }).metadata?.beneficiary_type || 'Beneficiaries'}</p>
                    <p className="text-sm font-semibold text-gray-900">{(project.direct_beneficiaries || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* UC Certificate Indicator */}
              {(project as any).uc_link && (
                <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-blue-700">Utilization Certificate Available</span>
                  <a
                    href={(project as any).uc_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    View
                  </a>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    console.log('Viewing project details. UC Link:', (project as any).uc_link);
                    console.log('Full project:', project);
                    setSelectedProjectDetails(project);
                  }}
                  className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 rounded-lg transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDuplicateProject(project)}
                  className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  title="Duplicate this project"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => handleViewProjectDashboard(project)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  View Dashboard
                </button>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {displayProjects.length === 0 && (
        <div className="mt-12 text-center">
          <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No projects found</p>
          <p className="text-gray-500 text-sm mt-1">
            {workFilter ? 'Try changing your filters or work type selection.' : 'Create a new project to get started.'}
          </p>
        </div>
      )}

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
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
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
                  {(effectiveRole === 'admin' || effectiveRole === 'accountant') && (
                    <button
                      type="button"
                      onClick={() => handleEditProject(selectedProjectDetails)}
                      disabled={isPreparingEdit}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:bg-emerald-300"
                    >
                      {isPreparingEdit ? 'Preparing...' : 'Edit Project'}
                    </button>
                  )}
                  {effectiveRole === 'admin' && (
                    <button
                      type="button"
                      onClick={() => openProjectDeleteModal(selectedProjectDetails)}
                      disabled={isDeletingProject && projectToDelete?.id === selectedProjectDetails.id}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                      <div className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </div>
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
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Subcompany</p>
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
                    <p className="text-2xl font-bold text-emerald-900">₹{((selectedProjectDetails.total_budget || 0) / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Utilized</p>
                    <p className="text-2xl font-bold text-blue-900">₹{((selectedProjectDetails.utilized_budget || 0) / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-700 uppercase mb-1">{selectedProjectBeneficiaryLabel}</p>
                    <p className="text-2xl font-bold text-purple-900">{selectedProjectBeneficiaryDisplayValue}</p>
                    {selectedProjectBeneficiaryName && (
                      <p className="text-xs text-purple-600 mt-1">
                        {(selectedProjectBeneficiaryCount).toLocaleString()} beneficiaries recorded
                      </p>
                    )}
                  </div>
                </div>

                {/* Utilization Certificate */}
                {selectedProjectDetails.uc_link && (
                  <div className="border border-blue-200 bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-blue-900">Utilization Certificate</h3>
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Uploaded</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={selectedProjectDetails.uc_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium text-center transition-colors"
                      >
                        View UC Document
                      </a>
                      <a
                        href={selectedProjectDetails.uc_link}
                        download
                        className="px-4 py-2 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}

                {/* Budget Categories */}
                {(projectBudgetCategories.length > 0 || budgetCategoriesLoading) && (
                  <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-emerald-900">Budget Categories</h3>
                      <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full">
                        {projectBudgetCategories.filter(cat => cat.parent_id === null).length} categor{projectBudgetCategories.filter(cat => cat.parent_id === null).length !== 1 ? 'ies' : 'y'}
                      </span>
                    </div>
                    {budgetCategoriesLoading ? (
                      <p className="text-sm text-emerald-700">Loading budget categories...</p>
                    ) : (
                      <div className="space-y-3">
                        {projectBudgetCategories
                          .filter(cat => cat.parent_id === null)
                          .map((category) => {
                            const children = projectBudgetCategories.filter(cat => cat.parent_id === category.id);
                            const utilizationPercent = category.allocated_amount > 0 
                              ? (category.utilized_amount / category.allocated_amount) * 100 
                              : 0;
                            
                            return (
                              <div key={category.id} className="bg-white rounded-xl p-4 border border-emerald-100">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                      <div>
                                        <span className="text-gray-500">Allocated: </span>
                                        <span className="font-semibold text-emerald-700">₹{category.allocated_amount.toLocaleString()}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Utilized: </span>
                                        <span className="font-semibold text-blue-700">₹{category.utilized_amount.toLocaleString()}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Available: </span>
                                        <span className="font-semibold text-purple-700">₹{category.available_amount.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs text-gray-500">Utilization</span>
                                    <p className="text-lg font-bold text-gray-900">{utilizationPercent.toFixed(1)}%</p>
                                  </div>
                                </div>
                                
                                {/* Progress bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                  <div 
                                    className="bg-emerald-500 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                                  ></div>
                                </div>
                                
                                {/* Sub-categories */}
                                {children.length > 0 && (
                                  <div className="mt-3 pl-4 border-l-2 border-emerald-200 space-y-2">
                                    {children.map((subCat) => {
                                      const subUtilizationPercent = subCat.allocated_amount > 0 
                                        ? (subCat.utilized_amount / subCat.allocated_amount) * 100 
                                        : 0;
                                      
                                      return (
                                        <div key={subCat.id} className="bg-emerald-50 rounded-lg p-3">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <p className="font-medium text-gray-800 text-sm">{subCat.name}</p>
                                              <div className="flex items-center gap-3 mt-1 text-xs">
                                                <span className="text-gray-600">₹{subCat.allocated_amount.toLocaleString()}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-blue-600">Used: ₹{subCat.utilized_amount.toLocaleString()}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-purple-600">Left: ₹{subCat.available_amount.toLocaleString()}</span>
                                              </div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700">{subUtilizationPercent.toFixed(1)}%</span>
                                          </div>
                                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                            <div 
                                              className="bg-emerald-400 h-1.5 rounded-full transition-all"
                                              style={{ width: `${Math.min(subUtilizationPercent, 100)}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Projects (Beneficiary Projects) */}
                {(subProjects.length > 0 || subProjectsLoading) && (
                  <div className="border border-amber-200 bg-amber-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-amber-900">Beneficiary Sub-Projects</h3>
                      <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                        {subProjects.length} sub-project{subProjects.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {subProjectsLoading ? (
                      <p className="text-sm text-amber-700">Loading sub-projects...</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {subProjects.map((subProject) => (
                          <div
                            key={subProject.id}
                            className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100 hover:border-amber-300 cursor-pointer transition-colors"
                            onClick={() => setSelectedSubProject(subProject)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                                {subProject.beneficiary_number || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{subProject.name}</p>
                                <p className="text-xs text-gray-500">
                                  {subProject.status === 'active' ? 'Active' : 
                                   subProject.status === 'completed' ? 'Completed' : 
                                   subProject.status === 'planning' ? 'Planning' :
                                   subProject.status === 'on_hold' ? 'On Hold' :
                                   subProject.status === 'cancelled' ? 'Cancelled' :
                                   subProject.status === 'archived' ? 'Archived' : subProject.status}
                                </p>
                              </div>
                            </div>
                            <button
                              className="text-xs text-amber-600 hover:text-amber-800 font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubProject(subProject);
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Impact Metrics */}
                <div className="border border-gray-100 rounded-2xl p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Impact Metrics</h3>
                      <p className="text-xs text-gray-500">Primary and secondary metrics recorded for this project</p>
                    </div>
                    {effectiveRole === 'admin' && !isEditingImpactMetrics && (
                      <button
                        onClick={handleStartEditImpactMetrics}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Edit Metrics
                      </button>
                    )}
                  </div>

                  {isEditingImpactMetrics ? (
                    <div className="space-y-3">
                      {impactMetricsForm.length === 0 && (
                        <p className="text-sm text-gray-500">No metrics selected yet. Add one below to start tracking.</p>
                      )}

                      {impactMetricsForm.map((metric, index) => (
                        <div
                          key={metric.key === 'custom' ? `project-custom-${index}` : `project-${metric.key}`}
                          className="flex items-center gap-2"
                        >
                          <span className="text-sm text-gray-700 flex-1">
                            {metric.key === 'custom' && metric.customLabel
                              ? metric.customLabel
                              : IMPACT_METRIC_LABELS[metric.key as keyof typeof IMPACT_METRIC_LABELS] || metric.key}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={metric.value ?? 0}
                            onChange={(e) => handleUpdateImpactMetricValue(metric.key, Number(e.target.value), metric.customLabel)}
                            className="w-28 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => handleRemoveImpactMetric(metric.key, metric.customLabel)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <div className="pt-2 border-t border-gray-100">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddImpactMetric(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          defaultValue=""
                        >
                          <option value="" disabled>Add predefined metric...</option>
                          {PREDEFINED_METRIC_KEYS.filter(
                            (key) =>
                              key !== 'custom' && !impactMetricsForm.find((metric) => metric.key === key)
                          ).map((key) => (
                            <option key={`add-${key}`} value={key}>
                              {IMPACT_METRIC_LABELS[key]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Custom metric name..."
                          value={projectCustomMetricName}
                          onChange={(e) => setProjectCustomMetricName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddProjectCustomMetric();
                            }
                          }}
                        />
                        <button
                          onClick={handleAddProjectCustomMetric}
                          disabled={!projectCustomMetricName.trim()}
                          className="px-3 py-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleCancelImpactMetricsEdit}
                          className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                          disabled={isSubmittingImpactMetrics}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveImpactMetrics}
                          disabled={isSubmittingImpactMetrics}
                          className="flex-1 px-3 py-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg disabled:opacity-50"
                        >
                          {isSubmittingImpactMetrics ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {impactMetricFlags.hasPrimary && (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase">Primary Metrics</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {PRIMARY_IMPACT_METRICS.map((key) => {
                              const value = getImpactMetricValue(aggregatedImpactMetrics, key);
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
                        </div>
                      )}

                      {impactMetricFlags.hasSecondary && (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase">Additional Metrics</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {SECONDARY_IMPACT_METRICS.map((key) => {
                              const value = getImpactMetricValue(aggregatedImpactMetrics, key);
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
                        </div>
                      )}

                      {!impactMetricFlags.hasAny && (
                        <p className="text-sm text-gray-500">No impact metrics recorded yet. Click Edit to add metrics for this project.</p>
                      )}
                    </>
                  )}
                </div>

                {/* Custom Metrics */}
                {aggregatedCustomMetrics.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-purple-700">Custom Metrics</p>
                      <span className="text-xs text-purple-500">Includes beneficiary sub-project values</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aggregatedCustomMetrics.map((metric) => (
                        <div key={metric.label} className="rounded-xl p-4 border bg-purple-50 border-purple-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-purple-100 rounded-xl">
                              <FolderKanban className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-semibold text-purple-700">{metric.label}</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">{metric.value.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
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

      <AnimatePresence>
        {isDeleteModalOpen && projectToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeProjectDeleteModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-red-600">Delete Project</p>
                  <h3 className="text-2xl font-bold text-gray-900">Confirm removal</h3>
                </div>
                <button
                  type="button"
                  onClick={closeProjectDeleteModal}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close delete modal"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600">
                Deleting "{projectToDelete.name}" removes it from the dashboard and its reporting will no longer be available.
                This action cannot be undone.
              </p>
              {projectDeleteError && (
                <p className="mt-4 text-sm text-red-600">{projectDeleteError}</p>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeProjectDeleteModal}
                  disabled={isDeletingProject}
                  className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmProjectDelete}
                  disabled={isDeletingProject}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-60 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeletingProject ? 'Deleting...' : 'Delete project'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-Project Details Modal */}
      <AnimatePresence>
        {selectedSubProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
            onClick={() => setSelectedSubProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                      {selectedSubProject.beneficiary_number || '?'}
                    </div>
                    <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                      Beneficiary Sub-Project
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSubProject.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedSubProject(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4">
                {selectedSubProject.description && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                    <p className="text-gray-700">{selectedSubProject.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedSubProject.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      selectedSubProject.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      selectedSubProject.status === 'planning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedSubProject.status === 'active' ? 'Active' : 
                       selectedSubProject.status === 'completed' ? 'Completed' : 
                       selectedSubProject.status === 'planning' ? 'Planning' :
                       selectedSubProject.status === 'on_hold' ? 'On Hold' :
                       selectedSubProject.status === 'cancelled' ? 'Cancelled' :
                       selectedSubProject.status === 'archived' ? 'Archived' : selectedSubProject.status}
                    </span>
                  </div>
                  {selectedSubProject.work && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Work Type</p>
                      <p className="text-gray-700">{selectedSubProject.work}</p>
                    </div>
                  )}
                </div>

                {(selectedSubProject.location || selectedSubProject.state) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {selectedSubProject.location}
                      {selectedSubProject.location && selectedSubProject.state && ', '}
                      {selectedSubProject.state}
                    </span>
                  </div>
                )}

                {(selectedSubProject.start_date || selectedSubProject.expected_end_date) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {selectedSubProject.start_date && new Date(selectedSubProject.start_date).toLocaleDateString()}
                      {selectedSubProject.start_date && selectedSubProject.expected_end_date && ' - '}
                      {selectedSubProject.expected_end_date && new Date(selectedSubProject.expected_end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Impact Metrics Section */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Impact Metrics</h3>
                    {effectiveRole === 'admin' && !isEditingSubProjectMetrics && (
                      <button
                        onClick={handleStartEditSubProjectMetrics}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Edit Metrics
                      </button>
                    )}
                  </div>

                  {isEditingSubProjectMetrics ? (
                    // Edit Mode
                    <div className="space-y-3">
                      {/* Existing metrics */}
                      {subProjectMetricsForm.map((metric, index) => (
                        <div key={metric.key === 'custom' ? `custom-${index}` : metric.key} className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 flex-1">
                            {metric.key === 'custom' && metric.customLabel 
                              ? metric.customLabel 
                              : IMPACT_METRIC_LABELS[metric.key as keyof typeof IMPACT_METRIC_LABELS] || metric.key}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={metric.value}
                            onChange={(e) => handleUpdateSubProjectMetricValue(metric.key, Number(e.target.value), metric.customLabel)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => handleRemoveSubProjectMetric(metric.key, metric.customLabel)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add new metric dropdown */}
                      <div className="pt-2 border-t border-gray-100">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddSubProjectMetric(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          defaultValue=""
                        >
                          <option value="" disabled>Add predefined metric...</option>
                          {PREDEFINED_METRIC_KEYS.filter(
                            key => !subProjectMetricsForm.find(m => m.key === key)
                          ).map((key) => (
                            <option key={key} value={key}>
                              {IMPACT_METRIC_LABELS[key]}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Add custom metric */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Custom metric name..."
                          value={customMetricName}
                          onChange={(e) => setCustomMetricName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomMetric();
                            }
                          }}
                        />
                        <button
                          onClick={handleAddCustomMetric}
                          disabled={!customMetricName.trim()}
                          className="px-3 py-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>

                      {/* Save/Cancel buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setIsEditingSubProjectMetrics(false)}
                          className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                          disabled={isSubmittingSubProjectMetrics}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveSubProjectMetrics}
                          disabled={isSubmittingSubProjectMetrics}
                          className="flex-1 px-3 py-2 text-sm text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg disabled:opacity-50"
                        >
                          {isSubmittingSubProjectMetrics ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      {selectedSubProject.impact_metrics && selectedSubProject.impact_metrics.length > 0 ? (
                        <div className="space-y-3">
                          {/* Primary metrics */}
                          {PRIMARY_IMPACT_METRICS.some((key) => getImpactMetricValue(selectedSubProject.impact_metrics, key) > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {PRIMARY_IMPACT_METRICS.map((key) => {
                                const value = getImpactMetricValue(selectedSubProject.impact_metrics as ImpactMetricEntry[], key);
                                if (value <= 0) return null;
                                const visual = IMPACT_METRIC_VISUALS[key];
                                const Icon = visual.icon;
                                return (
                                  <div key={`sub-${key}`} className={`rounded-xl p-3 border ${visual.wrapperClasses}`}>
                                    <div className="flex items-center gap-2 mb-1">
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

                          {/* Secondary metrics */}
                          {SECONDARY_IMPACT_METRICS.some((key) => getImpactMetricValue(selectedSubProject.impact_metrics, key) > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {SECONDARY_IMPACT_METRICS.map((key) => {
                                const value = getImpactMetricValue(selectedSubProject.impact_metrics as ImpactMetricEntry[], key);
                                if (value <= 0) return null;
                                const visual = IMPACT_METRIC_VISUALS[key];
                                const Icon = visual.icon;
                                return (
                                  <div key={`sub-secondary-${key}`} className={`rounded-xl p-3 border ${visual.wrapperClasses}`}>
                                    <div className="flex items-center gap-2 mb-1">
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

                          {/* Custom metrics */}
                          {(selectedSubProject.impact_metrics as ImpactMetricEntry[])?.filter(m => m.key === 'custom' && m.customLabel && m.value > 0).length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(selectedSubProject.impact_metrics as ImpactMetricEntry[])
                                .filter(m => m.key === 'custom' && m.customLabel && m.value > 0)
                                .map((metric, idx) => (
                                  <div key={`sub-custom-${idx}`} className="rounded-xl p-3 border bg-purple-50 border-purple-100">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="p-2 bg-purple-100 rounded-xl">
                                        <FolderKanban className="w-5 h-5 text-purple-600" />
                                      </div>
                                      <span className="text-sm font-semibold text-purple-700">
                                        {metric.customLabel || 'Custom Metric'}
                                      </span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-900">{metric.value.toLocaleString()}</p>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">
                          No impact metrics recorded yet.
                          {effectiveRole === 'admin' && ' Click "Edit Metrics" to add.'}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Budget Info */}
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">
                    {selectedSubProjectBeneficiaryLabel}
                  </p>
                  <p className="text-lg font-bold text-emerald-900">{selectedSubProjectBeneficiaryCount.toLocaleString()}</p>
                  {selectedSubProjectBeneficiaryLabel !== 'Beneficiaries' && (
                    <p className="text-xs text-emerald-700 mt-1">
                      {selectedSubProjectBeneficiaryCount.toLocaleString()} beneficiary recorded
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6">
                <button
                  onClick={() => setSelectedSubProject(null)}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors"
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
          ucFile={ucFile}
          setUcFile={setUcFile}
          uploadingUcFile={uploadingUcFile}
          onClose={handleModalClose}
          onSubmit={handleSaveProject}
          isEditing={Boolean(editingProjectId)}
          projects={projects}
          teamTemplates={teamTemplates}
          templatesLoading={templatesLoading}
          onLoadTemplate={handleLoadTemplate}
          onSaveTemplate={() => setShowSaveTemplateModal(true)}
          onManageTemplates={() => setShowManageTemplatesModal(true)}
        />
      )}

      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-emerald-100 p-6"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900">Save Team Template</h3>
              <p className="text-sm text-gray-600 mt-1">
                Save the current team member configuration as a reusable template
              </p>
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Template Name *
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g., Standard Project Team"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  autoFocus
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Description (Optional)
                <textarea
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  placeholder="Describe when to use this template..."
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </label>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Team members to save:</strong> {formData.teamMembers.filter((m) => m.userId).length} member(s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowSaveTemplateModal(false);
                  setNewTemplateName('');
                  setNewTemplateDescription('');
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={!newTemplateName.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Template
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Manage Templates Modal */}
      {showManageTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-emerald-100 p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manage Team Templates</h3>
                <p className="text-sm text-gray-600 mt-1">View and delete saved team templates</p>
              </div>
              <button
                onClick={() => setShowManageTemplatesModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {templatesLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                <Loader className="w-5 h-5 animate-spin" />
                Loading templates...
              </div>
            ) : teamTemplates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">No templates saved yet</p>
                <p className="text-sm text-gray-400">
                  Add team members to a project and click "Save Current Team as Template" to create your first template
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        {template.description && (
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="ml-3 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Team Members ({template.members.length})
                      </p>
                      {template.members.map((member, idx) => (
                        <div
                          key={`${template.id}-member-${idx}`}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-700">
                            {member.user?.full_name || member.user_id}
                          </span>
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {member.role.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        handleLoadTemplate(template.id);
                        setShowManageTemplatesModal(false);
                      }}
                      className="mt-3 w-full px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm transition-colors"
                    >
                      Load This Template
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowManageTemplatesModal(false)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
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
const buildProjectPayload = (values: ProjectFormData, ucLink?: string) => {
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
    work: values.work.trim() || undefined,
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
    beneficiary_type: values.beneficiaryType.trim() || undefined,
    metadata: {
      beneficiary_type: values.beneficiaryType.trim() || 'Direct Beneficiaries',
    },
    uc_link: ucLink || undefined,
    funding_partner: values.fundingPartner.trim() || undefined,
    created_by: undefined,
    updated_by: undefined,
  };
};

const buildProjectUpdatePayload = (values: ProjectFormData, ucLink?: string): Partial<ProjectServiceProject> => {
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
    work: values.work.trim() || undefined,
    status: values.status,
    start_date: values.startDate || undefined,
    expected_end_date: values.expectedEndDate || undefined,
    impact_metrics: cleanedMetrics,
    beneficiary_type: values.beneficiaryType.trim() || undefined,
    metadata: {
      beneficiary_type: values.beneficiaryType.trim() || 'Direct Beneficiaries',
    },
  };

  if (budgetValue !== undefined) {
    payload.total_budget = budgetValue;
  }
  if (beneficiaries !== undefined) {
    payload.direct_beneficiaries = beneficiaries;
  }
  if (ucLink) {
    (payload as any).uc_link = ucLink;
  }
  if (values.fundingPartner.trim()) {
    (payload as any).funding_partner = values.fundingPartner.trim();
  }

  return payload;
};

// Budget Categories Manager Component
interface BudgetCategoriesManagerProps {
  totalBudget: number;
  categories: BudgetCategoryFormEntry[];
  onCategoriesChange: (categories: BudgetCategoryFormEntry[]) => void;
}

const BudgetCategoriesManager = ({
  totalBudget,
  categories,
  onCategoriesChange,
}: BudgetCategoriesManagerProps) => {
  const [validationError, setValidationError] = useState('');

  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addRootCategory = () => {
    onCategoriesChange([
      ...categories,
      {
        id: generateTempId(),
        name: '',
        allocated_amount: '',
        parent_id: null,
        children: [],
      },
    ]);
    setValidationError('');
  };

  const addSubCategory = (parentId: string) => {
    const addSubToCategory = (cats: BudgetCategoryFormEntry[]): BudgetCategoryFormEntry[] => {
      return cats.map((cat) => {
        if (cat.id === parentId) {
          return {
            ...cat,
            children: [
              ...cat.children,
              {
                id: generateTempId(),
                name: '',
                allocated_amount: '',
                parent_id: parentId,
                children: [],
              },
            ],
          };
        }
        if (cat.children.length > 0) {
          return { ...cat, children: addSubToCategory(cat.children) };
        }
        return cat;
      });
    };

    onCategoriesChange(addSubToCategory(categories));
    setValidationError('');
  };

  const updateCategory = (
    id: string,
    field: 'name' | 'allocated_amount',
    value: string
  ) => {
    const updateInTree = (cats: BudgetCategoryFormEntry[]): BudgetCategoryFormEntry[] => {
      return cats.map((cat) => {
        if (cat.id === id) {
          return { ...cat, [field]: value };
        }
        if (cat.children.length > 0) {
          return { ...cat, children: updateInTree(cat.children) };
        }
        return cat;
      });
    };

    const updated = updateInTree(categories);
    onCategoriesChange(updated);
    validateAllocations(updated);
  };

  const removeCategory = (id: string) => {
    const removeFromTree = (cats: BudgetCategoryFormEntry[]): BudgetCategoryFormEntry[] => {
      return cats
        .filter((cat) => cat.id !== id)
        .map((cat) => ({
          ...cat,
          children: removeFromTree(cat.children),
        }));
    };

    const updated = removeFromTree(categories);
    onCategoriesChange(updated);
    validateAllocations(updated);
  };

  const validateAllocations = (cats: BudgetCategoryFormEntry[]) => {
    // Validate root categories don't exceed total budget
    const rootTotal = cats.reduce((sum, cat) => sum + (Number(cat.allocated_amount) || 0), 0);
    
    if (rootTotal > totalBudget) {
      setValidationError(
        `Total allocated (₹${rootTotal.toLocaleString()}) exceeds project budget (₹${totalBudget.toLocaleString()})`
      );
      return false;
    }

    // Validate each parent's children don't exceed parent allocation
    const validateChildren = (parent: BudgetCategoryFormEntry): boolean => {
      if (parent.children.length > 0) {
        const childrenTotal = parent.children.reduce(
          (sum, child) => sum + (Number(child.allocated_amount) || 0),
          0
        );
        const parentAmount = Number(parent.allocated_amount) || 0;

        if (childrenTotal > parentAmount) {
          setValidationError(
            `Sub-categories of "${parent.name}" (₹${childrenTotal.toLocaleString()}) exceed parent allocation (₹${parentAmount.toLocaleString()})`
          );
          return false;
        }

        return parent.children.every(validateChildren);
      }
      return true;
    };

    const allValid = cats.every(validateChildren);
    if (allValid) {
      setValidationError('');
    }

    return allValid;
  };

  const calculateRemaining = () => {
    const allocated = categories.reduce((sum, cat) => sum + (Number(cat.allocated_amount) || 0), 0);
    return totalBudget - allocated;
  };

  const renderCategory = (category: BudgetCategoryFormEntry, level: number = 0) => {
    const remaining = category.children.length > 0
      ? (Number(category.allocated_amount) || 0) -
        category.children.reduce((sum, child) => sum + (Number(child.allocated_amount) || 0), 0)
      : 0;

    return (
      <div key={category.id} className={`${level > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex gap-3 items-start">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <input
                type="text"
                value={category.name}
                onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                placeholder={level === 0 ? 'Category name (e.g., Admin Cost)' : 'Sub-category name (e.g., Travel)'}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
              <input
                type="number"
                value={category.allocated_amount}
                onChange={(e) => updateCategory(category.id, 'allocated_amount', e.target.value)}
                placeholder="Amount (₹)"
                className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                min="0"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addSubCategory(category.id)}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Add sub-category"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeCategory(category.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove category"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {category.children.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Remaining: ₹{remaining.toLocaleString()}
            </div>
          )}
        </div>

        {category.children.length > 0 && (
          <div className="border-l-2 border-emerald-200 pl-4">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Budget Categories</p>
          <p className="text-xs text-gray-600 mt-1">
            Total Budget: ₹{totalBudget.toLocaleString()} | Allocated: ₹
            {categories
              .reduce((sum, cat) => sum + (Number(cat.allocated_amount) || 0), 0)
              .toLocaleString()}{' '}
            | Remaining: ₹{calculateRemaining().toLocaleString()}
          </p>
        </div>
        <button
          type="button"
          onClick={addRootCategory}
          className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{validationError}</p>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No categories added yet. Click "Add Category" to start.
        </div>
      ) : (
        <div className="space-y-2">{categories.map((cat) => renderCategory(cat))}</div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        💡 Tip: Create main categories first, then click the + icon to add sub-categories. All amounts should add up to the total budget.
      </p>
    </div>
  );
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
  ucFile: File | null;
  setUcFile: Dispatch<SetStateAction<File | null>>;
  uploadingUcFile: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  projects: Project[];
  teamTemplates: TeamTemplate[];
  templatesLoading: boolean;
  onLoadTemplate: (templateId: string) => void;
  onSaveTemplate: () => void;
  onManageTemplates: () => void;
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
  ucFile,
  setUcFile,
  uploadingUcFile,
  onClose,
  onSubmit,
  isEditing,
  projects,
  teamTemplates,
  templatesLoading,
  onLoadTemplate,
  onSaveTemplate,
  onManageTemplates,
}: AddProjectModalProps) => {
  const [metricNameInput, setMetricNameInput] = useState('');
  const [metricError, setMetricError] = useState('');
  const selectedPartner = csrPartners.find((partner) => partner.id === formData.csrPartnerId);
  const partnerHasTolls = Boolean(selectedPartner?.has_toll);
  const TEAM_ROLE_OPTIONS: Array<{ value: ProjectTeamRole; label: string }> = [
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'team_member', label: 'Team Member' },
  ];
  const projectNameSelectValue = formData.projectNameIsCustom ? 'custom' : formData.name || '';
  const availablePredefinedMetrics = useMemo(
    () =>
      PREDEFINED_METRIC_KEYS.filter(
        (key) => !formData.impactMetrics.some((metric) => metric.key === key)
      ),
    [formData.impactMetrics]
  );

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

  const handleQuickAddPredefinedMetric = (key: ImpactMetricKey) => {
    setFormData((prev) => {
      if (prev.impactMetrics.some((metric) => metric.key === key)) {
        return prev;
      }
      return {
        ...prev,
        impactMetrics: [...prev.impactMetrics, { key, value: 0 }],
      };
    });
    setMetricError('');
  };

  const handleTollSelection = (tollId: string) => {
    const selectedToll = tolls.find((toll) => toll.id === tollId);
    const tollState = selectedToll?.state ?? '';
    setFormData((prev) => ({
      ...prev,
      tollId,
      location: selectedToll?.city ?? prev.location,
      state: selectedToll?.state ?? prev.state,
      isCustomState: selectedToll
        ? Boolean(tollState && !INDIAN_STATES.includes(tollState as typeof INDIAN_STATES[number]))
        : prev.isCustomState,
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
                  const partnerState = partner?.state ?? '';
                  setFormData((prev) => ({
                    ...prev,
                    csrPartnerId: partnerId,
                    tollId: '', // Reset toll when partner changes
                    // Auto-fill location from CSR partner when no toll
                    location: partner?.city ?? '',
                    state: partnerState,
                    isCustomState: Boolean(partnerState && !INDIAN_STATES.includes(partnerState as typeof INDIAN_STATES[number])),
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

          {/* Subcompany Selection - Only show if partner has subcompanies */}
          {formData.csrPartnerId && partnerHasTolls && (
            <label className="text-sm font-medium text-gray-700">
              Subcompany
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
                  <option value="">Direct Partner</option>
                  {tolls.map((toll) => (
                    <option key={toll.id} value={toll.id}>
                      {toll.toll_name || toll.poc_name}
                      {toll.city ? ` • ${toll.city}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm">
                  No subcompanies available for this partner
                </div>
              )}
            </label>
          )}
          {formData.csrPartnerId && !partnerHasTolls && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600">
              This partner does not manage subcompanies separately. Project location will use the CSR partner's city/state.
            </div>
          )}
        </div>

        {/* Project Name and Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">
            Project Name *
            <select
              value={projectNameSelectValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') {
                  setFormData((prev) => ({
                    ...prev,
                    projectNameIsCustom: true,
                    name: prev.projectNameIsCustom ? prev.name : '',
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    projectNameIsCustom: false,
                    name: value,
                  }));
                }
              }}
              required
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="" disabled>
                Select project name
              </option>
              {PROJECT_NAME_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value="custom">Custom...</option>
            </select>
          </label>
          {formData.projectNameIsCustom && (
            <label className="text-sm font-medium text-gray-700">
              Custom Project Name *
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
                placeholder="Enter custom project name"
              />
            </label>
          )}
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
          <div className="text-sm font-medium text-gray-700">
            State
            <select
              value={formData.isCustomState ? 'custom' : formData.state}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') {
                  setFormData((prev) => ({
                    ...prev,
                    state: '',
                    isCustomState: true,
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    state: value,
                    isCustomState: false,
                  }));
                }
              }}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
              <option value="custom">Custom...</option>
            </select>
          </div>
        </div>

        {/* Custom State Input */}
        {formData.isCustomState && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-gray-700">
              Custom State Name
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
                placeholder="Enter custom state..."
              />
            </label>
          </div>
        )}

        {/* Work and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">
            Work Type
            <select
              value={formData.work}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  work: e.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Select Work Type</option>
              {WORK_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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

        {/* Funding Partner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm font-medium text-gray-700">
            Funding Partner
            <select
              value={formData.isCustomFundingPartner ? 'custom' : formData.fundingPartner}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') {
                  setFormData((prev) => ({
                    ...prev,
                    fundingPartner: '',
                    isCustomFundingPartner: true,
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    fundingPartner: value,
                    isCustomFundingPartner: false,
                  }));
                }
              }}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Select Funding Partner</option>
              {(() => {
                const uniqueFundingPartners = Array.from(
                  new Set(
                    projects
                      .map(p => (p as any).funding_partner)
                      .filter(fp => fp && fp.trim())
                  )
                ).sort();
                return uniqueFundingPartners.map((partner) => (
                  <option key={partner} value={partner}>
                    {partner}
                  </option>
                ));
              })()}
              <option value="custom">Other (Custom)...</option>
            </select>
          </div>
          {formData.isCustomFundingPartner && (
            <label className="text-sm font-medium text-gray-700">
              Custom Funding Partner Name
              <input
                type="text"
                value={formData.fundingPartner}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fundingPartner: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter funding partner name..."
              />
            </label>
          )}
        </div>

        {/* Team Members Assignment */}
        <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Project Team</p>
              <p className="text-xs text-gray-500">Assign accountants, project managers, and team members</p>
            </div>
            <button
              type="button"
              onClick={onManageTemplates}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Manage Templates
            </button>
          </div>

          {/* Team Templates Section */}
          {!teamUsersLoading && teamUsers.length > 0 && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Load Team Template
                </label>
                {templatesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 px-3 py-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Loading templates...
                  </div>
                ) : teamTemplates.length > 0 ? (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        onLoadTemplate(e.target.value);
                        e.target.value = ''; // Reset selection
                      }
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a template...</option>
                    {teamTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.members.length} members)
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-gray-500 italic px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    No templates saved yet
                  </p>
                )}
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={onSaveTemplate}
                  disabled={formData.teamMembers.filter((m) => m.userId).length === 0}
                  className="w-full px-3 py-2 rounded-lg border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  💾 Save Current Team as Template
                </button>
              </div>
            </div>
          )}

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

          <button
            type="button"
            onClick={handleAddTeamMemberRow}
            disabled={teamUsersLoading || teamUsers.length === 0}
            className="mt-3 w-full px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Member
          </button>

          <p className="mt-3 text-xs text-gray-500">
            Allowed roles: Project Manager, Accountant, Team Member. Add as many members as needed for this project.
          </p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Start Date *
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
              required
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Expected End Date *
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
              required
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
            Number of Beneficiaries
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

        {/* Budget Categories Checkbox and Interface */}
        {formData.totalBudget && Number(formData.totalBudget) > 0 && (
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableBudgetCategories}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    enableBudgetCategories: e.target.checked,
                    budgetCategories: e.target.checked ? prev.budgetCategories : [],
                  }))
                }
                className="mt-1 w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="font-semibold text-blue-900">Create Budget Categories</p>
                <p className="text-sm text-blue-700 mt-1">
                  Break down the total budget into categories (e.g., Admin Cost, Operations, HR) and optionally create sub-categories for detailed tracking.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Budget Categories Management */}
        {formData.enableBudgetCategories && (
          <BudgetCategoriesManager
            totalBudget={Number(formData.totalBudget) || 0}
            categories={formData.budgetCategories}
            onCategoriesChange={(categories) =>
              setFormData((prev) => ({ ...prev, budgetCategories: categories }))
            }
          />
        )}

        {/* Beneficiary Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm font-medium text-gray-700">
            Beneficiary Type
            <select
              value={BENEFICIARY_TYPES.includes(formData.beneficiaryType as typeof BENEFICIARY_TYPES[number]) ? formData.beneficiaryType : (formData.beneficiaryType && formData.beneficiaryType !== 'Direct Beneficiaries' ? 'custom' : 'Direct Beneficiaries')}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') {
                  setFormData((prev) => ({
                    ...prev,
                    beneficiaryType: ' ', // Set to space to trigger custom input
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    beneficiaryType: value,
                  }));
                }
              }}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {BENEFICIARY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="custom">Custom...</option>
            </select>
          </div>
          {formData.beneficiaryType && !BENEFICIARY_TYPES.includes(formData.beneficiaryType as typeof BENEFICIARY_TYPES[number]) && (
            <label className="text-sm font-medium text-gray-700">
              Custom Beneficiary Name
              <input
                type="text"
                value={formData.beneficiaryType.trim()}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    beneficiaryType: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter custom beneficiary type..."
              />
            </label>
          )}
        </div>


        {/* Create Beneficiary Sub-Projects Checkbox */}
        {!isEditing && Number(formData.directBeneficiaries) > 0 && (
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.createBeneficiaryProjects}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    createBeneficiaryProjects: e.target.checked,
                  }))
                }
                className="mt-1 w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Create individual beneficiary sub-projects
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  This will create {formData.directBeneficiaries} sub-projects under this main project, 
                  one for each direct beneficiary. Each sub-project can be tracked individually.
                </p>
              </div>
            </label>
          </div>
        )}

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

          <div className="space-y-3">
            {availablePredefinedMetrics.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-700 mb-2">
                  Quick add predefined metrics
                </p>
                <div className="flex flex-wrap gap-2">
                  {availablePredefinedMetrics.map((key) => (
                    <button
                      key={`quick-add-${key}`}
                      type="button"
                      onClick={() => handleQuickAddPredefinedMetric(key)}
                      className="px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-50"
                    >
                      {IMPACT_METRIC_LABELS[key]}
                    </button>
                  ))}
                </div>
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
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddMetricField();
                    }
                  }}
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
        </div>

        {/* Utilization Certificate Upload */}
        <div className="border border-gray-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Utilization Certificate (Optional)</h4>
          
          {/* Show current UC document if exists */}
          {formData.uc_link && !ucFile && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Current UC </p>
                  <p className="text-xs text-blue-700 mt-1">A Utilization certificate has been uploaded for this project</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={formData.uc_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    View
                  </a>
                  <a
                    href={formData.uc_link}
                    download
                    className="px-3 py-1.5 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.uc_link ? 'Replace UC Document' : 'Upload UC Document'}
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 10 * 1024 * 1024) {
                    alert('File size must be less than 10MB');
                    e.target.value = '';
                    return;
                  }
                  setUcFile(file);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload UC document as image or PDF (max 10MB)
            </p>
            {ucFile && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs font-medium text-emerald-700">New file selected: {ucFile.name}</p>
                <p className="text-xs text-emerald-600 mt-1">This will replace the current UC document when you save</p>
              </div>
            )}
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
            disabled={isSubmitting || partnersLoading || uploadingUcFile}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center gap-2"
          >
            {uploadingUcFile ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Uploading UC...
              </>
            ) : isSubmitting ? (
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
