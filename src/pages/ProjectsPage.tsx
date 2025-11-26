import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderKanban, DollarSign, X } from 'lucide-react';
import { useFilter } from '../context/useFilter';
import { useAuth } from '../context/useAuth';
import FilterBar from '../components/FilterBar';
import type { Project } from '../services/filterService';

const ProjectsPage = () => {
  const { projects, filteredProjects, selectedPartner, selectedProject } = useFilter();
  const { currentRole } = useAuth();
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<Project | null>(null);

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
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors">
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
    </div>
  );
};

export default ProjectsPage;
