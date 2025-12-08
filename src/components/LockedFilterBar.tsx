import { useProjectContext } from '../context/useProjectContext';
import { Building2, FolderKanban, Lock } from 'lucide-react';

/**
 * LockedFilterBar Component
 * 
 * Used when a user navigates from Projects Dashboard to a role-specific dashboard.
 * Displays the pre-selected project and CSR partner as read-only locked filters.
 * User cannot change or reset these filters.
 * 
 * This ensures that:
 * 1. Users can only see data for their assigned project
 * 2. Multi-role users see only the specific project they clicked on
 * 3. Filters are always applied and cannot be accidentally reset
 */

const LockedFilterBar = () => {
  const { projectName, projectCode, csrPartnerName, isProjectSelected } = useProjectContext();

  if (!isProjectSelected) {
    return null; // Don't show if no project is selected
  }

  const displayProjectName = projectCode ? `${projectName} : ${projectCode}` : projectName;

  return (
    <div className="bg-linear-to-r from-emerald-50 to-emerald-100 border-b-2 border-emerald-300 px-8 py-4">
      <div className="flex items-center gap-8 flex-wrap">
        {/* Info Banner */}
        <div className="flex items-center gap-2 text-sm">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-emerald-700 font-semibold">Project Context Locked</span>
        </div>

        {/* CSR Partner Display */}
        <div className="flex items-center gap-3 bg-white/60 px-4 py-2.5 rounded-xl border border-emerald-200">
          <Building2 className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">CSR Partner</p>
            <p className="text-sm font-bold text-emerald-900">{csrPartnerName}</p>
          </div>
          <Lock className="w-4 h-4 text-emerald-400 ml-2" />
        </div>

        {/* Project Display */}
        <div className="flex items-center gap-3 bg-white/60 px-4 py-2.5 rounded-xl border border-emerald-200">
          <FolderKanban className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Project</p>
            <p className="text-sm font-bold text-emerald-900">{displayProjectName}</p>
          </div>
          <Lock className="w-4 h-4 text-emerald-400 ml-2" />
        </div>

        {/* Info Text */}
        <div className="text-xs text-emerald-600 ml-auto">
          All data is filtered to this project only. To view other projects, return to Projects Dashboard.
        </div>
      </div>
    </div>
  );
};

export default LockedFilterBar;
