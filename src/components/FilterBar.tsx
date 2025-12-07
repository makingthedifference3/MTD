import { useFilter } from '../context/useFilter';
import type { CSRPartner, Project } from '../services/filterService';
import type { Toll } from '../services/tollsService';
import { Building2, FolderKanban, X, Loader, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterBarProps {
  workFilter?: string;
  onWorkFilterChange?: (value: string) => void;
  workOptions?: string[];
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
}

const FilterBar = ({ workFilter = '', onWorkFilterChange, workOptions = [], statusFilter = '', onStatusFilterChange }: FilterBarProps = {}) => {
  const {
    selectedPartner,
    selectedProject,
    selectedToll,
    csrPartners,
    filteredProjects,
    tolls,
    isLoading,
    error,
    filtersLocked,
    setSelectedPartner,
    setSelectedProject,
    setSelectedToll,
    resetFilters,
  } = useFilter();

  console.log('FilterBar - selectedPartner:', selectedPartner);
  console.log('FilterBar - filteredProjects:', filteredProjects);
  console.log('FilterBar - filteredProjects count:', filteredProjects.length);

  // Get selected partner name
  const selectedPartnerName = selectedPartner
    ? csrPartners.find((cp: CSRPartner) => cp.id === selectedPartner)?.name
    : null;

  // Get selected project name
  const selectedProjectName = selectedProject
    ? filteredProjects.find((p: Project) => p.id === selectedProject)?.name
    : null;

  const selectedTollInfo = selectedToll ? tolls.find((toll: Toll) => toll.id === selectedToll) : null;
  const selectedTollName = selectedTollInfo?.toll_name || selectedTollInfo?.poc_name || null;

  const handlePartnerChange = (partnerId: string) => {
    setSelectedToll(null); // clear toll when switching partners so stale toll filters disappear
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

  const handleTollChange = (tollId: string) => {
    setSelectedProject(null);
    if (tollId === 'all') {
      setSelectedToll(null);
    } else {
      setSelectedToll(tollId);
    }
  };

  const handleWorkChange = (value: string) => {
    if (!onWorkFilterChange) return;
    onWorkFilterChange(value === 'all' ? '' : value);
  };

  const handleStatusChange = (value: string) => {
    if (!onStatusFilterChange) return;
    onStatusFilterChange(value === 'all' ? '' : value);
  };

  const showWorkFilter = Boolean(onWorkFilterChange && workOptions.length > 0);
  const showStatusFilter = Boolean(onStatusFilterChange);

  const hasActiveFilters = Boolean(
    selectedPartner ||
    selectedProject ||
    selectedToll ||
    (showWorkFilter && workFilter) ||
    (showStatusFilter && statusFilter)
  );

  const handleResetFilters = () => {
    resetFilters();
    if (onWorkFilterChange) {
      onWorkFilterChange('');
    }
    if (onStatusFilterChange) {
      onStatusFilterChange('');
    }
  };

  if (error) {
    console.error('FilterBar Error:', error);
  }

  const formatProjectLabel = (project: Project) => {
    const location = project.location?.trim();
    return location ? `${project.name} (${location})` : project.name;
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border-b border-emerald-100 px-8 py-4">
      {filtersLocked && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm font-medium text-blue-800">
            Project view is locked to: <strong>{selectedPartnerName}</strong>
            {selectedTollName && <> → <strong>{selectedTollName}</strong></>}
            {selectedProjectName && <> → <strong>{selectedProjectName}</strong></>}
          </span>
        </div>
      )}
      <div className="flex items-center gap-4 flex-wrap">
        {/* CSR Partner Dropdown */}
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-semibold text-emerald-700 mb-2">
            CSR Partner {filtersLocked && <span className="text-blue-600">(Locked)</span>}
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            {isLoading ? (
              <div className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-200 bg-white text-gray-500 flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Loading partners...
              </div>
            ) : (
              <select
                value={selectedPartner || 'all'}
                onChange={(e) => handlePartnerChange(e.target.value)}
                disabled={filtersLocked}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white text-gray-900 font-medium text-sm appearance-none cursor-pointer hover:border-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option value="all">Overall (All Partners)</option>
                {csrPartners.map((partner: CSRPartner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
            )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Subcompany Dropdown */}
        {selectedPartner && (
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs font-semibold text-emerald-700 mb-2">
              Subcompany {filtersLocked && <span className="text-blue-600">(Locked)</span>}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <select
                value={selectedToll || 'all'}
                onChange={(e) => handleTollChange(e.target.value)}
                disabled={tolls.length === 0 || isLoading || filtersLocked}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white text-gray-900 font-medium text-sm appearance-none cursor-pointer hover:border-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                <option value="all">{tolls.length ? 'All Subcompanies (Partner-wise)' : 'No subcompanies available'}</option>
                {tolls.map((toll: Toll) => (
                  <option key={toll.id} value={toll.id}>
                    {toll.toll_name || toll.poc_name}
                    {toll.city ? ` • ${toll.city}` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Project Dropdown */}
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-semibold text-emerald-700 mb-2">
            Project {filtersLocked && <span className="text-blue-600">(Locked)</span>}
          </label>
          <div className="relative">
            <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <select
              value={selectedProject || 'all'}
              onChange={(e) => handleProjectChange(e.target.value)}
              disabled={!selectedPartner || isLoading || filtersLocked}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white text-gray-900 font-medium text-sm appearance-none cursor-pointer hover:border-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="all">
                {selectedPartner ? 'All Projects (Partner-wise)' : 'Select Partner First'}
              </option>
              {filteredProjects.map((project: Project) => (
                <option key={project.id} value={project.id}>
                  {formatProjectLabel(project)}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Work Filter */}
        {showWorkFilter && (
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs font-semibold text-emerald-700 mb-2">Work Type</label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <select
                value={workFilter || 'all'}
                onChange={(e) => handleWorkChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white text-gray-900 font-medium text-sm appearance-none cursor-pointer hover:border-emerald-300"
              >
                <option value="all">All Work Types</option>
                {workOptions.map((work) => (
                  <option key={work} value={work}>
                    {work}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Status Filter */}
        {showStatusFilter && (
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs font-semibold text-emerald-700 mb-2">Project Status</label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <select
                value={statusFilter || 'all'}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white text-gray-900 font-medium text-sm appearance-none cursor-pointer hover:border-emerald-300"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="planning">Planning</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

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
                onClick={handleResetFilters}
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
            {selectedTollName && (
              <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                {selectedTollName}
              </span>
            )}
            {showWorkFilter && workFilter && (
              <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium">
                Work: {workFilter}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterBar;
