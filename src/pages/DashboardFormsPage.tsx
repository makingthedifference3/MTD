import { useState, useEffect, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban, ChevronRight, ArrowLeft, MapPin, Briefcase, Leaf, Building2, Heart,
  GraduationCap, Users, Activity, Award, type LucideIcon,
  Plus, Minus, Edit, Save, X, Loader
} from 'lucide-react';
import { useFilter } from '../context/useFilter';
import FilterBar from '../components/FilterBar';
import type { Project } from '../services/filterService';
import { projectsService } from '../services/projectsService';

// Helper function to map icon names to actual Lucide icons
const getIconComponent = (iconName?: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'Leaf': Leaf,
    'Heart': Heart,
    'GraduationCap': GraduationCap,
    'FolderKanban': FolderKanban,
    'Activity': Activity,
    'Laptop': Building2,
    'Users': Users,
    'Briefcase': Briefcase,
    'AlertCircle': Award,
    'TrendingUp': Activity,
  };
  return iconMap[iconName || 'FolderKanban'] || FolderKanban;
};

interface ProjectWithBeneficiaries extends Project {
  displayName?: string;
  total_budget?: number;
  utilized_budget?: number;
}

interface EditableMetrics {
  direct_beneficiaries: number;
  meals_served: number;
  pads_distributed: number;
  students_enrolled: number;
  trees_planted: number;
  schools_renovated: number;
}

interface EditableProjectInfo {
  name: string;
  description: string;
  location: string;
  state: string;
  status: string;
  total_budget: number;
  utilized_budget: number;
  indirect_beneficiaries: number;
}

const DashboardFormsPage = () => {
  const {
    csrPartners,
    selectedPartner,
    selectedProject,
    filteredProjects,
    projects,
    setSelectedPartner,
    setSelectedProject,
    resetFilters,
    refreshData,
    isLoading,
    error,
  } = useFilter();

  const [viewMode, setViewMode] = useState<'partners' | 'projects' | 'projectDetails'>('partners');
  const [selectedProjectData, setSelectedProjectData] = useState<ProjectWithBeneficiaries | null>(null);
  
  // Editable metrics state
  const [editableMetrics, setEditableMetrics] = useState<EditableMetrics>({
    direct_beneficiaries: 0,
    meals_served: 0,
    pads_distributed: 0,
    students_enrolled: 0,
    trees_planted: 0,
    schools_renovated: 0,
  });
  
  // Project info editing state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editableInfo, setEditableInfo] = useState<EditableProjectInfo>({
    name: '',
    description: '',
    location: '',
    state: '',
    status: 'active',
    total_budget: 0,
    utilized_budget: 0,
    indirect_beneficiaries: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Auto-switch to projects view when a partner is selected via FilterBar
  useEffect(() => {
    if (selectedPartner) {
      setViewMode('projects');
    }
  }, [selectedPartner]);

  // Auto-switch to project details when a project is selected via FilterBar
  useEffect(() => {
    if (selectedProject && filteredProjects.length > 0) {
      const project = filteredProjects.find(p => p.id === selectedProject);
      if (project) {
        setSelectedProjectData(project as ProjectWithBeneficiaries);
        setViewMode('projectDetails');
        // Initialize editable metrics
        setEditableMetrics({
          direct_beneficiaries: project.direct_beneficiaries || 0,
          meals_served: project.meals_served || 0,
          pads_distributed: project.pads_distributed || 0,
          students_enrolled: project.students_enrolled || 0,
          trees_planted: project.trees_planted || 0,
          schools_renovated: project.schools_renovated || 0,
        });
        // Initialize editable info
        setEditableInfo({
          name: project.name || '',
          description: project.description || '',
          location: project.location || '',
          state: project.state || '',
          status: project.status || 'active',
          total_budget: (project as ProjectWithBeneficiaries).total_budget || 0,
          utilized_budget: (project as ProjectWithBeneficiaries).utilized_budget || 0,
          indirect_beneficiaries: project.indirect_beneficiaries || 0,
        });
      }
    }
  }, [selectedProject, filteredProjects]);

  // Get selected partner object
  const selectedPartnerObject = selectedPartner 
    ? csrPartners.find(p => p.id === selectedPartner)
    : null;

  const partnerProjects = filteredProjects;

  const handlePartnerClick = (partnerId: string) => {
    setSelectedPartner(partnerId);
    setViewMode('projects');
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProjectData(project as ProjectWithBeneficiaries);
    setSelectedProject(project.id);
    setViewMode('projectDetails');
    // Initialize editable metrics
    setEditableMetrics({
      direct_beneficiaries: project.direct_beneficiaries || 0,
      meals_served: project.meals_served || 0,
      pads_distributed: project.pads_distributed || 0,
      students_enrolled: project.students_enrolled || 0,
      trees_planted: project.trees_planted || 0,
      schools_renovated: project.schools_renovated || 0,
    });
    // Initialize editable info
    setEditableInfo({
      name: project.name || '',
      description: project.description || '',
      location: project.location || '',
      state: project.state || '',
      status: project.status || 'active',
      total_budget: (project as ProjectWithBeneficiaries).total_budget || 0,
      utilized_budget: (project as ProjectWithBeneficiaries).utilized_budget || 0,
      indirect_beneficiaries: project.indirect_beneficiaries || 0,
    });
  };

  const handleBack = () => {
    if (viewMode === 'projectDetails') {
      setViewMode('projects');
      setSelectedProjectData(null);
      setSelectedProject(null);
      setIsEditingInfo(false);
    } else if (viewMode === 'projects') {
      setViewMode('partners');
      setSelectedPartner(null);
      resetFilters();
    }
  };

  // Metric increment/decrement handlers
  const incrementMetric = (key: keyof EditableMetrics) => {
    setEditableMetrics(prev => ({
      ...prev,
      [key]: prev[key] + 1,
    }));
  };

  const decrementMetric = (key: keyof EditableMetrics) => {
    setEditableMetrics(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] - 1),
    }));
  };

  const handleMetricInputChange = (key: keyof EditableMetrics, value: number) => {
    setEditableMetrics(prev => ({
      ...prev,
      [key]: Math.max(0, Number.isNaN(value) ? 0 : value),
    }));
  };

  // Save metrics to database
  const handleSaveMetrics = async () => {
    if (!selectedProjectData) return;
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      await projectsService.updateProject(selectedProjectData.id, {
        direct_beneficiaries: editableMetrics.direct_beneficiaries,
        total_beneficiaries: editableMetrics.direct_beneficiaries,
        meals_served: editableMetrics.meals_served,
        pads_distributed: editableMetrics.pads_distributed,
        students_enrolled: editableMetrics.students_enrolled,
        trees_planted: editableMetrics.trees_planted,
        schools_renovated: editableMetrics.schools_renovated,
      });
      
      // Refresh data
      if (refreshData) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to save metrics:', err);
      setSaveError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Save project info to database
  const handleSaveInfo = async () => {
    if (!selectedProjectData) return;
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      await projectsService.updateProject(selectedProjectData.id, {
        name: editableInfo.name,
        description: editableInfo.description,
        location: editableInfo.location,
        state: editableInfo.state,
        status: editableInfo.status as 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived',
        total_budget: editableInfo.total_budget,
        utilized_budget: editableInfo.utilized_budget,
        indirect_beneficiaries: editableInfo.indirect_beneficiaries,
      });
      
      setIsEditingInfo(false);
      
      // Refresh data
      if (refreshData) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to save project info:', err);
      setSaveError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-emerald-50/20 to-gray-50 p-4 md:p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 via-emerald-400/5 to-transparent rounded-3xl blur-3xl"></div>
        <div className="relative bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl shadow-emerald-500/5 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent">
                  Dashboard Forms
                </h1>
                <p className="text-gray-600 mt-1 font-medium">
                  {viewMode === 'partners' && 'Select CSR Partner to view and edit their projects'}
                  {viewMode === 'projects' && selectedPartnerObject && `Projects by ${selectedPartnerObject.name}`}
                  {viewMode === 'projectDetails' && selectedProjectData && `Editing: ${selectedProjectData.name}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Back Button */}
      {viewMode !== 'partners' && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all font-semibold text-gray-900 hover:text-emerald-600 shadow-lg hover:shadow-emerald-500/20"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {/* PARTNERS VIEW */}
        {viewMode === 'partners' && (
          <motion.div
            key="partners"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
                <p className="text-gray-600 font-semibold">Loading partners...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            ) : csrPartners.length === 0 ? (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
                <p className="text-amber-800 font-semibold text-lg">No CSR Partners found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {csrPartners.map((partner, index) => {
                  const partnerProjectCount = projects.filter((p: Project) => p.csr_partner_id === partner.id).length;
                  return (
                    <motion.button
                      key={partner.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handlePartnerClick(partner.id)}
                      className="group relative text-left"
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100"></div>
                      
                      <div className="relative bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-all">
                              <Briefcase className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                              {partnerProjectCount} Projects
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.name}</h3>
                          {partner.company_name && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{partner.company_name}</p>
                          )}
                          
                          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
                            View Projects
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* PROJECTS VIEW */}
        {viewMode === 'projects' && selectedPartnerObject && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                <Building2 className="w-4 h-4" />
                {selectedPartnerObject.name}
              </div>
            </div>

            {partnerProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnerProjects.map((project, index) => {
                  const Icon = getIconComponent(project.display_icon);
                  
                  return (
                    <motion.button
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleProjectClick(project)}
                      className="group relative text-left"
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100"></div>
                      
                      <div className="relative bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-all">
                              <Icon className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                              {project.status || 'Active'}
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                          
                          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
                            Edit Project
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">No projects found for this partner</p>
              </div>
            )}
          </motion.div>
        )}

        {/* PROJECT DETAILS VIEW - EDITABLE */}
        {viewMode === 'projectDetails' && selectedProjectData && (
          <motion.div
            key="projectDetails"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Error Display */}
              {saveError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 font-medium">
                  {saveError}
                </div>
              )}

              {/* Project Info Card - Editable */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Project Information</h3>
                  {!isEditingInfo ? (
                    <button
                      onClick={() => setIsEditingInfo(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-100 transition-colors border-2 border-emerald-200"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditingInfo(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveInfo}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {isEditingInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Read-only fields */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">PROJECT ID</label>
                      <div className="px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 font-mono text-sm">
                        {selectedProjectData.id}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">PROJECT CODE</label>
                      <div className="px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 font-mono">
                        {selectedProjectData.project_code}
                      </div>
                    </div>
                    
                    {/* Editable fields */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">STATUS</label>
                      <select
                        value={editableInfo.status}
                        onChange={(e) => setEditableInfo(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white"
                      >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">LOCATION</label>
                      <input
                        type="text"
                        value={editableInfo.location}
                        onChange={(e) => setEditableInfo(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                        placeholder="e.g., Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">STATE</label>
                      <input
                        type="text"
                        value={editableInfo.state}
                        onChange={(e) => setEditableInfo(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                        placeholder="e.g., Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">TOTAL BUDGET (₹)</label>
                      <input
                        type="number"
                        value={editableInfo.total_budget}
                        onChange={(e) => setEditableInfo(prev => ({ ...prev, total_budget: Number(e.target.value) }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">UTILIZED BUDGET (₹)</label>
                      <input
                        type="number"
                        value={editableInfo.utilized_budget}
                        onChange={(e) => setEditableInfo(prev => ({ ...prev, utilized_budget: Number(e.target.value) }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-2">BUDGET REMAINING</label>
                      <div className="px-4 py-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 font-bold">
                        ₹{(editableInfo.total_budget - editableInfo.utilized_budget).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">INDIRECT BENEFICIARIES</label>
                      <input
                        type="number"
                        value={editableInfo.indirect_beneficiaries}
                        onChange={(e) => setEditableInfo(prev => ({ ...prev, indirect_beneficiaries: Number(e.target.value) }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project ID */}
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">PROJECT ID</p>
                      <p className="text-gray-800 font-mono text-sm">{selectedProjectData.id}</p>
                    </div>
                    {/* Project Code */}
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">PROJECT CODE</p>
                      <p className="text-gray-800 font-mono font-bold">{selectedProjectData.project_code}</p>
                    </div>
                    {/* Status */}
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">STATUS</p>
                      <p className="text-gray-800 font-semibold">{selectedProjectData.status || 'active'}</p>
                    </div>
                    {/* Location */}
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">LOCATION</p>
                      <p className="text-gray-800 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        {selectedProjectData.location || 'N/A'}
                      </p>
                    </div>
                    {/* State */}
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">STATE</p>
                      <p className="text-gray-800 font-semibold">{selectedProjectData.state || 'N/A'}</p>
                    </div>
                    {/* Total Budget */}
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">TOTAL BUDGET</p>
                      <p className="text-gray-800 font-bold">₹{((selectedProjectData as ProjectWithBeneficiaries).total_budget || 0).toLocaleString()}</p>
                    </div>
                    {/* Utilized Budget */}
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">UTILIZED BUDGET</p>
                      <p className="text-gray-800 font-bold">₹{((selectedProjectData as ProjectWithBeneficiaries).utilized_budget || 0).toLocaleString()}</p>
                    </div>
                    {/* Budget Remaining */}
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">BUDGET REMAINING</p>
                      <p className="text-emerald-600 font-bold">₹{(((selectedProjectData as ProjectWithBeneficiaries).total_budget || 0) - ((selectedProjectData as ProjectWithBeneficiaries).utilized_budget || 0)).toLocaleString()}</p>
                    </div>
                    {/* Indirect Beneficiaries */}
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">INDIRECT BENEFICIARIES</p>
                      <p className="text-gray-800 font-semibold">{selectedProjectData.indirect_beneficiaries || 0}</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Impact Metrics - Editable with +/- */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Impact Metrics</h3>
                  <button
                    onClick={handleSaveMetrics}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >
                    {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* No. of Beneficiaries */}
                  <MetricCard
                    label="NO. OF BENEFICIARY"
                    value={editableMetrics.direct_beneficiaries}
                    target={5000}
                    onIncrement={() => incrementMetric('direct_beneficiaries')}
                    onDecrement={() => decrementMetric('direct_beneficiaries')}
                    onValueChange={(value) => handleMetricInputChange('direct_beneficiaries', value)}
                    color="emerald"
                    icon={Users}
                  />

                  {/* Meals Served */}
                  <MetricCard
                    label="MEALS SERVED"
                    value={editableMetrics.meals_served}
                    target={10000}
                    onIncrement={() => incrementMetric('meals_served')}
                    onDecrement={() => decrementMetric('meals_served')}
                    onValueChange={(value) => handleMetricInputChange('meals_served', value)}
                    color="orange"
                    icon={Activity}
                  />

                  {/* Pads Distributed */}
                  <MetricCard
                    label="PADS DISTRIBUTED"
                    value={editableMetrics.pads_distributed}
                    target={50000}
                    onIncrement={() => incrementMetric('pads_distributed')}
                    onDecrement={() => decrementMetric('pads_distributed')}
                    onValueChange={(value) => handleMetricInputChange('pads_distributed', value)}
                    color="pink"
                    icon={Heart}
                  />

                  {/* Students Enrolled */}
                  <MetricCard
                    label="STUDENTS ENROLLED"
                    value={editableMetrics.students_enrolled}
                    target={1000}
                    onIncrement={() => incrementMetric('students_enrolled')}
                    onDecrement={() => decrementMetric('students_enrolled')}
                    onValueChange={(value) => handleMetricInputChange('students_enrolled', value)}
                    color="blue"
                    icon={GraduationCap}
                  />

                  {/* Schools Renovated */}
                  <MetricCard
                    label="SCHOOLS RENOVATED"
                    value={editableMetrics.schools_renovated}
                    target={50}
                    onIncrement={() => incrementMetric('schools_renovated')}
                    onDecrement={() => decrementMetric('schools_renovated')}
                    onValueChange={(value) => handleMetricInputChange('schools_renovated', value)}
                    color="purple"
                    icon={FolderKanban}
                  />

                  {/* Trees Planted */}
                  <MetricCard
                    label="TREES PLANTED"
                    value={editableMetrics.trees_planted}
                    target={10000}
                    onIncrement={() => incrementMetric('trees_planted')}
                    onDecrement={() => decrementMetric('trees_planted')}
                    onValueChange={(value) => handleMetricInputChange('trees_planted', value)}
                    color="green"
                    icon={Leaf}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Metric Card Component with +/- buttons
interface MetricCardProps {
  label: string;
  value: number;
  target: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onValueChange: (value: number) => void;
  color: string;
  icon: LucideIcon;
}

const MetricCard = ({ label, value, target, onIncrement, onDecrement, onValueChange, color, icon: Icon }: MetricCardProps) => {
  const colorClasses: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-200' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconBg: 'bg-orange-200' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', iconBg: 'bg-pink-200' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-200' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-200' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', iconBg: 'bg-green-200' },
  };

  const classes = colorClasses[color] || colorClasses.emerald;

  return (
    <div className={`${classes.bg} border-2 ${classes.border} rounded-2xl p-6`}>
      {/* Header with icon */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 ${classes.iconBg} rounded-lg`}>
          <Icon className={`w-5 h-5 ${classes.text}`} />
        </div>
        <span className={`text-sm font-bold ${classes.text} uppercase`}>{label}</span>
      </div>

      {/* Value Display with direct edit */}
      <div className="text-center mb-4">
        <input
          type="number"
          value={value}
          min={0}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const parsed = Number(event.target.value);
            onValueChange(Number.isNaN(parsed) ? 0 : parsed);
          }}
          className="w-full text-4xl font-black text-center text-gray-900 border-2 border-gray-200 rounded-2xl px-2 py-3 focus:border-emerald-500 focus:outline-none"
        />
        <p className="text-sm text-gray-400 mt-1">/{target.toLocaleString()}</p>
      </div>

      {/* Add / Minus Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onIncrement}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold transition-colors shadow-lg"
        >
          ADD
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={onDecrement}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-colors shadow-lg"
        >
          MINUS
          <Minus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DashboardFormsPage;
