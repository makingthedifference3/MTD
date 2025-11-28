import { useState, useEffect, useCallback } from 'react';
import type { FormEvent, Dispatch, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderKanban, DollarSign, X, MapPin, Calendar, Loader } from 'lucide-react';
import { useFilter } from '../context/useFilter';
import { useAuth } from '../context/useAuth';
import FilterBar from '../components/FilterBar';
import type { Project } from '../services/filterService';
import { projectsService } from '../services/projectsService';
import { getActiveCSRPartners, type CSRPartner } from '../services/csrPartnersService';
import { csrPartnerService, type CSRPartnerToll } from '../services/csrPartnerService';

const INITIAL_PROJECT_FORM = {
  name: '',
  projectCode: '',
  description: '',
  csrPartnerId: '',
  tollId: '', // New field for toll selection (optional)
  location: '',
  state: '',
  category: '',
  status: 'planning' as const,
  totalBudget: '',
  startDate: '',
  expectedEndDate: '',
  directBeneficiaries: '',
  padsDistributed: '',
  studentsEnrolled: '',
  schoolsRenovated: '',
  treesPlanted: '',
  mealsServed: '',
};

const ProjectsPage = () => {
  const { projects, filteredProjects, selectedPartner, selectedProject, refreshData } = useFilter();
  const { currentRole } = useAuth();
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<Project | null>(null);

  // Add project modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_PROJECT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [csrPartners, setCsrPartners] = useState<CSRPartner[]>([]);
  const [tolls, setTolls] = useState<CSRPartnerToll[]>([]); // State for tolls based on selected partner
  const [partnersLoading, setPartnersLoading] = useState(false);

  // Handle partner change - load tolls for selected partner
  const handlePartnerChange = useCallback(async (partnerId: string) => {
    setFormData((prev) => ({
      ...prev,
      csrPartnerId: partnerId,
      tollId: '', // Reset toll when partner changes
    }));

    if (partnerId) {
      try {
        const partnerTolls = await csrPartnerService.getTollsByPartner(partnerId);
        setTolls(partnerTolls);
      } catch (error) {
        console.error('Failed to fetch tolls:', error);
        setTolls([]);
      }
    } else {
      setTolls([]);
    }
  }, []);

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

  useEffect(() => {
    if (isAddModalOpen && csrPartners.length === 0) {
      fetchPartners();
    }
  }, [isAddModalOpen, csrPartners.length, fetchPartners]);

  const handleAddProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.name || !formData.csrPartnerId) {
      setFormError('Please fill in the project name and select a CSR partner.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload = buildProjectPayload(formData);
      await projectsService.createProject(payload);

      setIsAddModalOpen(false);
      setFormData({ ...INITIAL_PROJECT_FORM });
      // Refresh the projects list
      if (refreshData) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      const message = err instanceof Error ? err.message : 'Unable to create project. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
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
              onClick={() => setIsAddModalOpen(true)}
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
                <button
                  onClick={() => setSelectedProjectDetails(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
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
                <div className="grid grid-cols-2 gap-4">
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
                </div>

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
                {(selectedProjectDetails.meals_served || selectedProjectDetails.pads_distributed || selectedProjectDetails.trees_planted) && (
                  <div className="grid grid-cols-3 gap-4">
                    {selectedProjectDetails.meals_served !== undefined && selectedProjectDetails.meals_served > 0 && (
                      <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <p className="text-xs font-semibold text-orange-700 uppercase mb-1">Meals Served</p>
                        <p className="text-xl font-bold text-orange-900">{(selectedProjectDetails.meals_served).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedProjectDetails.pads_distributed !== undefined && selectedProjectDetails.pads_distributed > 0 && (
                      <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                        <p className="text-xs font-semibold text-pink-700 uppercase mb-1">Pads Distributed</p>
                        <p className="text-xl font-bold text-pink-900">{(selectedProjectDetails.pads_distributed).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedProjectDetails.trees_planted !== undefined && selectedProjectDetails.trees_planted > 0 && (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <p className="text-xs font-semibold text-green-700 uppercase mb-1">Trees Planted</p>
                        <p className="text-xl font-bold text-green-900">{(selectedProjectDetails.trees_planted).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Other Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedProjectDetails.students_enrolled !== undefined && selectedProjectDetails.students_enrolled > 0 && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Students Enrolled</p>
                      <p className="text-lg font-bold text-blue-900">{(selectedProjectDetails.students_enrolled).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedProjectDetails.schools_renovated !== undefined && selectedProjectDetails.schools_renovated > 0 && (
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">Schools Renovated</p>
                      <p className="text-lg font-bold text-indigo-900">{(selectedProjectDetails.schools_renovated).toLocaleString()}</p>
                    </div>
                  )}
                </div>
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
          onClose={() => {
            if (!isSubmitting) {
              setIsAddModalOpen(false);
              setFormError(null);
              setFormData({ ...INITIAL_PROJECT_FORM });
            }
          }}
          onSubmit={handleAddProject}
          onPartnerChange={handlePartnerChange}
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
const buildProjectPayload = (values: typeof INITIAL_PROJECT_FORM) => {
  const now = new Date().toISOString();
  const budgetValue = Number(values.totalBudget) || 0;
  const beneficiaries = Number(values.directBeneficiaries) || 0;

  return {
    project_code: values.projectCode.trim() || generateProjectCode(),
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    csr_partner_id: values.csrPartnerId,
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
    pads_distributed: Number(values.padsDistributed) || 0,
    students_enrolled: Number(values.studentsEnrolled) || 0,
    schools_renovated: Number(values.schoolsRenovated) || 0,
    trees_planted: Number(values.treesPlanted) || 0,
    meals_served: Number(values.mealsServed) || 0,
    created_by: undefined,
    updated_by: undefined,
  };
};

// Modal props interface
interface AddProjectModalProps {
  formData: typeof INITIAL_PROJECT_FORM;
  setFormData: Dispatch<SetStateAction<typeof INITIAL_PROJECT_FORM>>;
  isSubmitting: boolean;
  formError: string | null;
  csrPartners: CSRPartner[];
  partnersLoading: boolean;
  tolls: CSRPartnerToll[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPartnerChange: (partnerId: string) => void;
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
  onClose,
  onSubmit,
  onPartnerChange,
}: AddProjectModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
        <div>
          <p className="text-sm font-medium text-emerald-600">Create New Project</p>
          <h3 className="text-2xl font-bold text-gray-900">Add Project</h3>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close modal">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {/* CSR Partner Selection */}
        <div>
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
                onChange={(e) => onPartnerChange(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select a CSR Partner</option>
                {csrPartners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>

        {/* Toll/Sub-office Selection (Optional - only if tolls exist) */}
        {tolls.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-700">
              Toll/Sub-office (Optional)
              <select
                value={formData.tollId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tollId: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select a Toll/Sub-office (Optional)</option>
                {tolls.map((toll) => (
                  <option key={toll.id} value={toll.id}>
                    {toll.poc_name} ({toll.city}, {toll.state})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

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
                  status: e.target.value as typeof INITIAL_PROJECT_FORM.status,
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
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-sm font-semibold text-emerald-700 mb-4">Impact Metrics (Optional)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="text-sm font-medium text-gray-700">
              Meals Served
              <input
                type="number"
                value={formData.mealsServed}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mealsServed: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                placeholder="0"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Pads Distributed
              <input
                type="number"
                value={formData.padsDistributed}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    padsDistributed: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                placeholder="0"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Students Enrolled
              <input
                type="number"
                value={formData.studentsEnrolled}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    studentsEnrolled: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                placeholder="0"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Schools Renovated
              <input
                type="number"
                value={formData.schoolsRenovated}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    schoolsRenovated: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                placeholder="0"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Trees Planted
              <input
                type="number"
                value={formData.treesPlanted}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    treesPlanted: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                placeholder="0"
              />
            </label>
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
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  </div>
);

