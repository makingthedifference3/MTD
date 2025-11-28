/**
 * useProjectContext Hook
 * Use this in non-admin dashboards (AccountantDashboard, PMDashboard, TeamMemberDashboard)
 * to access the selected project and CSR partner from the projects dashboard.
 * 
 * Returns pre-selected filters that can be used to initialize filter state.
 */

import { useSelectedProject } from './useSelectedProject';

export interface ProjectContextFilters {
  projectId: string | null;
  projectName: string | null;
  csrPartnerId: string | null;
  csrPartnerName: string | null;
  projectRole: string | null;
  isProjectSelected: boolean;
}

export const useProjectContext = (): ProjectContextFilters => {
  const { projectId, projectName, csrPartnerId, csrPartnerName, projectRole } = useSelectedProject();

  return {
    projectId,
    projectName,
    csrPartnerId,
    csrPartnerName,
    projectRole,
    isProjectSelected: !!projectId && !!csrPartnerId,
  };
};

/**
 * Usage example in AccountantDashboard:
 * 
 * const { projectId, csrPartnerId, isProjectSelected } = useProjectContext();
 * 
 * useEffect(() => {
 *   if (isProjectSelected) {
 *     // Initialize filters with selected project and CSR partner
 *     setSelectedPartner(csrPartnerId);
 *     setSelectedProject(projectId);
 *   }
 * }, [isProjectSelected, projectId, csrPartnerId]);
 */
