import { useContext } from 'react';
import { ProjectContext, type SelectedProjectContext } from './ProjectContext';

export const useSelectedProject = (): SelectedProjectContext => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useSelectedProject must be used within ProjectProvider');
  }
  return context;
};
