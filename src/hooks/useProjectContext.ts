import { useEffect } from 'react';
import { useFilter } from '../context/useFilter';

interface ProjectContext {
  projectId: string;
  partnerId: string;
  tollId?: string;
  projectRole: string;
}

/**
 * Hook to handle project context from localStorage
 * This locks filters when viewing a specific project dashboard
 */
export const useProjectContextLock = () => {
  const { setSelectedPartner, setSelectedProject, setSelectedToll, lockFilters, unlockFilters } = useFilter();

  useEffect(() => {
    // Check for project context in localStorage
    const contextStr = localStorage.getItem('projectContext');
    
    if (contextStr) {
      try {
        const context: ProjectContext = JSON.parse(contextStr);
        
        // Set filters
        setSelectedPartner(context.partnerId);
        if (context.tollId) {
          setSelectedToll(context.tollId);
        }
        setSelectedProject(context.projectId);
        
        // Lock filters
        lockFilters();
        
        console.log('Project context loaded and filters locked:', context);
      } catch (error) {
        console.error('Error parsing project context:', error);
      }
    }

    // Cleanup: unlock filters when component unmounts
    return () => {
      unlockFilters();
    };
  }, [setSelectedPartner, setSelectedProject, setSelectedToll, lockFilters, unlockFilters]);
};

/**
 * Clear project context from localStorage
 */
export const clearProjectContext = () => {
  localStorage.removeItem('projectContext');
};

/**
 * Get current project context from localStorage
 */
export const getProjectContext = (): ProjectContext | null => {
  const contextStr = localStorage.getItem('projectContext');
  if (!contextStr) return null;
  
  try {
    return JSON.parse(contextStr);
  } catch {
    return null;
  }
};
