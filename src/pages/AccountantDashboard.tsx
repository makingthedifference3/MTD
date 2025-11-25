import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderKanban, ChevronRight,
  ArrowLeft, MapPin, Briefcase, Leaf, Building2, Heart, Droplet, GraduationCap,
  CheckCircle2, Users, Activity, Award, type LucideIcon
} from 'lucide-react';
import { useFilter } from '../context/useFilter';
import FilterBar from '../components/FilterBar';
import type { Project } from '../services/filterService';

// Helper function to map icon names to actual Lucide icons
const getIconComponent = (iconName?: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'Leaf': Leaf,
    'Heart': Heart,
    'GraduationCap': GraduationCap,
    'Droplet': Droplet,
    'FolderKanban': FolderKanban,
  };
  return iconMap[iconName || 'FolderKanban'] || FolderKanban;
};

interface ProjectWithBeneficiaries extends Project {
  description?: string;
  beneficiaryStats?: {
    totalBeneficiaries: number;
    mealsServed: number;
    padsDistributed: number;
    studentsEnrolled: number;
    treesPlanted: number;
    schoolsRenovated: number;
  };
}

const AccountantDashboard = () => {
  const {
    csrPartners,
    selectedPartner,
    selectedProject,
    filteredProjects,
    setSelectedPartner,
    setSelectedProject,
    resetFilters,
    isLoading,
    error,
  } = useFilter();

  const [viewMode, setViewMode] = useState<'partners' | 'projects' | 'projectDetails'>('partners');
  const [selectedProjectData, setSelectedProjectData] = useState<ProjectWithBeneficiaries | null>(null);

  // Auto-switch to projects view when a partner is selected via FilterBar
  useEffect(() => {
    if (selectedPartner) {
      setViewMode('projects');
    }
  }, [selectedPartner]);

  // Auto-switch to project details when a project is selected via FilterBar
  useEffect(() => {
    console.log('AccountantDashboard - selectedProject:', selectedProject);
    if (selectedProject && filteredProjects.length > 0) {
      const project = filteredProjects.find(p => p.id === selectedProject);
      console.log('AccountantDashboard - Found project:', project?.name);
      if (project) {
        const projectWithDesc: ProjectWithBeneficiaries = {
          ...project,
          beneficiaryStats: {
            totalBeneficiaries: project.total_beneficiaries || 0,
            mealsServed: project.meals_served || 0,
            padsDistributed: project.pads_distributed || 0,
            studentsEnrolled: project.students_enrolled || 0,
            treesPlanted: project.trees_planted || 0,
            schoolsRenovated: project.schools_renovated || 0,
          },
          description: project.description || 'No description available',
        };

        setSelectedProjectData(projectWithDesc);
        setViewMode('projectDetails');
      }
    }
  }, [selectedProject, filteredProjects]);

  // Get selected partner object from csrPartners using the selectedPartner ID from context
  const selectedPartnerObject = selectedPartner 
    ? csrPartners.find(p => p.id === selectedPartner)
    : null;

  // Get projects for selected partner - directly use filteredProjects which is already filtered by context
  const partnerProjects = filteredProjects;

  console.log('AccountantDashboard - selectedPartner:', selectedPartner);
  console.log('AccountantDashboard - partnerProjects count:', partnerProjects.length);
  console.log('AccountantDashboard - partnerProjects:', partnerProjects);

  const handlePartnerClick = (partnerId: string) => {
    setSelectedPartner(partnerId);
    setViewMode('projects');
  };

  const handleProjectClick = (project: Project) => {
    const projectWithDesc: ProjectWithBeneficiaries = {
      ...project,
      beneficiaryStats: {
        totalBeneficiaries: project.total_beneficiaries || 0,
        mealsServed: project.meals_served || 0,
        padsDistributed: project.pads_distributed || 0,
        studentsEnrolled: project.students_enrolled || 0,
        treesPlanted: project.trees_planted || 0,
        schoolsRenovated: project.schools_renovated || 0,
      },
      description: project.description || 'No description available',
    };
    
    setSelectedProjectData(projectWithDesc);
    setSelectedProject(project.id);
    setViewMode('projectDetails');
  };

  const handleBack = () => {
    if (viewMode === 'projectDetails') {
      setViewMode('projects');
      setSelectedProjectData(null);
      setSelectedProject(null);
    } else if (viewMode === 'projects') {
      setViewMode('partners');
      setSelectedPartner(null);
      resetFilters();
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
                  Project Command Center
                </h1>
                <p className="text-gray-600 mt-1 font-medium">
                  {viewMode === 'partners' && 'Select CSR Partner to view their projects'}
                  {viewMode === 'projects' && selectedPartnerObject && `Projects by ${selectedPartnerObject.name}`}
                  {viewMode === 'projectDetails' && selectedProjectData && `Project: ${selectedProjectData.name}`}
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-gray-600 font-semibold">Loading partners...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            ) : csrPartners.length === 0 ? (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
                <p className="text-amber-800 font-semibold text-lg">No CSR Partners found</p>
                <p className="text-amber-700 mt-2">Please insert sample data into the database first</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {csrPartners.map((partner, index) => {
                // Count projects for this partner from filteredProjects
                const partnerProjectCount = filteredProjects.filter((p: Project) => p.csr_partner_id === partner.id).length;
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
                  // Get icon and color from database, fallback to defaults
                  const Icon = getIconComponent(project.display_icon);
                  const colorClass = project.display_color || 'emerald';
                  
                  return (
                    <motion.button
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleProjectClick(project)}
                      className="group relative text-left"
                    >
                      <div className={`absolute inset-0 bg-linear-to-br from-${colorClass}-500/20 to-${colorClass}-600/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100`}></div>
                      
                      <div className="relative bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${colorClass}-500/5 rounded-bl-3xl group-hover:bg-${colorClass}-500/10 transition-colors`}></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 bg-${colorClass}-100 group-hover:bg-${colorClass}-200 rounded-xl transition-all`}>
                              <Icon className={`w-6 h-6 text-${colorClass}-600`} />
                            </div>
                            <div className={`text-sm font-bold text-${colorClass}-600 bg-${colorClass}-50 px-3 py-1 rounded-full`}>
                              {project.status || 'Active'}
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                          
                          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
                            View Details
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

        {/* PROJECT DETAILS VIEW */}
        {viewMode === 'projectDetails' && selectedProjectData && (
          <motion.div
            key="projectDetails"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-4xl mx-auto">
              {/* Project Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-6 shadow-lg"
              >
                <div className="flex items-start gap-6 mb-6">
                  <div className="p-4 bg-emerald-100 rounded-xl">
                    <FolderKanban className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedProjectData.name}</h2>
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        {selectedProjectData.status || 'Active'}
                      </span>
                      {selectedPartnerObject && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                          <Building2 className="w-4 h-4" />
                          {selectedPartnerObject.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Project Overview</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedProjectData.description}</p>
                </div>

                {/* Beneficiary Stats */}
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Impact Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Total Beneficiaries */}
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700 uppercase">Total Reach</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-900">
                      {selectedProjectData.beneficiaryStats?.totalBeneficiaries.toLocaleString() || '0'}
                    </p>
                  </div>

                  {/* Meals Served */}
                  {(selectedProjectData.beneficiaryStats?.mealsServed || 0) > 0 && (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-orange-600" />
                        <span className="text-xs font-bold text-orange-700 uppercase">Meals</span>
                      </div>
                      <p className="text-2xl font-black text-orange-900">
                        {((selectedProjectData.beneficiaryStats?.mealsServed || 0) / 1000).toFixed(1)}K
                      </p>
                    </div>
                  )}

                  {/* Pads Distributed */}
                  {(selectedProjectData.beneficiaryStats?.padsDistributed || 0) > 0 && (
                    <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-pink-600" />
                        <span className="text-xs font-bold text-pink-700 uppercase">Pads</span>
                      </div>
                      <p className="text-2xl font-black text-pink-900">
                        {((selectedProjectData.beneficiaryStats?.padsDistributed || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  )}

                  {/* Students Enrolled */}
                  {(selectedProjectData.beneficiaryStats?.studentsEnrolled || 0) > 0 && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        <span className="text-xs font-bold text-blue-700 uppercase">Students</span>
                      </div>
                      <p className="text-2xl font-black text-blue-900">
                        {(selectedProjectData.beneficiaryStats?.studentsEnrolled || 0).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Trees Planted */}
                  {(selectedProjectData.beneficiaryStats?.treesPlanted || 0) > 0 && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="w-5 h-5 text-green-600" />
                        <span className="text-xs font-bold text-green-700 uppercase">Trees</span>
                      </div>
                      <p className="text-2xl font-black text-green-900">
                        {((selectedProjectData.beneficiaryStats?.treesPlanted || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  )}

                  {/* Schools Renovated */}
                  {(selectedProjectData.beneficiaryStats?.schoolsRenovated || 0) > 0 && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderKanban className="w-5 h-5 text-purple-600" />
                        <span className="text-xs font-bold text-purple-700 uppercase">Schools</span>
                      </div>
                      <p className="text-2xl font-black text-purple-900">
                        {selectedProjectData.beneficiaryStats?.schoolsRenovated || '0'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg"
              >
                <h3 className="font-bold text-gray-900 mb-6 text-lg">Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">PROJECT ID</p>
                    <p className="text-gray-900 font-bold">{selectedProjectData.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">STATUS</p>
                    <p className="text-gray-900 font-bold">{selectedProjectData.status || 'Active'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">LOCATION</p>
                    <p className="text-gray-900 font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {selectedProjectData.location || 'India'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountantDashboard;
