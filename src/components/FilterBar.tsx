import { useFilter } from '../context/FilterContext';
import { csrPartners, projects } from '../mockData';
import { Building2, FolderKanban, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterBar = () => {
  const { selectedPartner, selectedProject, setSelectedPartner, setSelectedProject, resetFilters } = useFilter();

  // Filter projects based on selected partner
  const filteredProjects = selectedPartner
    ? projects.filter((p) => p.partnerId === selectedPartner)
    : projects;

  // Get selected partner name
  const selectedPartnerName = selectedPartner
    ? csrPartners.find((cp) => cp.id === selectedPartner)?.name
    : null;

  // Get selected project name
  const selectedProjectName = selectedProject
    ? projects.find((p) => p.id === selectedProject)?.name
    : null;

  const handlePartnerChange = (partnerId: string) => {
    if (partnerId === 'all') {
      setSelectedPartner(null);
      setSelectedProject(null);
    } else {
      setSelectedPartner(partnerId);
      setSelectedProject(null); // Reset project when partner changes
    }
  };

  const handleProjectChange = (projectId: string) => {
    if (projectId === 'all') {
      setSelectedProject(null);
    } else {
      setSelectedProject(projectId);
    }
  };

  const hasActiveFilters = selectedPartner || selectedProject;

  return (
    <div className="bg-white/70 backdrop-blur-xl border-b border-emerald-100 px-8 py-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* CSR Partner Dropdown */}
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-semibold text-emerald-700 mb-2">CSR Partner</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <select
              value={selectedPartner || 'all'}
              onChange={(e) => handlePartnerChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white text-gray-900 font-medium text-sm appearance-none cursor-pointer hover:border-emerald-300"
            >
              <option value="all">Overall (All Partners)</option>
              {csrPartners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Project Dropdown */}
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-semibold text-emerald-700 mb-2">Project</label>
          <div className="relative">
            <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <select
              value={selectedProject || 'all'}
              onChange={(e) => handleProjectChange(e.target.value)}
              disabled={!selectedPartner}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white text-gray-900 font-medium text-sm appearance-none cursor-pointer hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="all">
                {selectedPartner ? 'All Projects (Partner-wise)' : 'Select Partner First'}
              </option>
              {filteredProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-end"
            >
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4" />
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex items-center gap-2 flex-wrap"
          >
            <span className="text-xs font-semibold text-emerald-700">Active Filters:</span>
            {selectedPartnerName && (
              <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium flex items-center gap-2">
                <Building2 className="w-3 h-3" />
                {selectedPartnerName}
              </span>
            )}
            {selectedProjectName && (
              <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium flex items-center gap-2">
                <FolderKanban className="w-3 h-3" />
                {selectedProjectName}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterBar;
