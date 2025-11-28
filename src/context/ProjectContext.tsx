import { createContext, useState, type ReactNode } from 'react';

export interface SelectedProjectContext {
  projectId: string | null;
  projectName: string | null;
  csrPartnerId: string | null;
  csrPartnerName: string | null;
  projectRole: string | null;
  setSelectedProject: (
    projectId: string,
    projectName: string,
    csrPartnerId: string,
    csrPartnerName: string,
    projectRole: string
  ) => void;
  clearSelectedProject: () => void;
}

const ProjectContext = createContext<SelectedProjectContext | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectId, setProjectId] = useState<string | null>(() => {
    const saved = localStorage.getItem('selectedProjectId');
    return saved || null;
  });

  const [projectName, setProjectName] = useState<string | null>(() => {
    const saved = localStorage.getItem('selectedProjectName');
    return saved || null;
  });

  const [csrPartnerId, setCSRPartnerId] = useState<string | null>(() => {
    const saved = localStorage.getItem('selectedCSRPartnerId');
    return saved || null;
  });

  const [csrPartnerName, setCSRPartnerName] = useState<string | null>(() => {
    const saved = localStorage.getItem('selectedCSRPartnerName');
    return saved || null;
  });

  const [projectRole, setProjectRole] = useState<string | null>(() => {
    const saved = localStorage.getItem('selectedProjectRole');
    return saved || null;
  });

  const handleSetSelectedProject = (
    projectId: string,
    projectName: string,
    csrPartnerId: string,
    csrPartnerName: string,
    projectRole: string
  ) => {
    setProjectId(projectId);
    setProjectName(projectName);
    setCSRPartnerId(csrPartnerId);
    setCSRPartnerName(csrPartnerName);
    setProjectRole(projectRole);

    // Persist to localStorage
    localStorage.setItem('selectedProjectId', projectId);
    localStorage.setItem('selectedProjectName', projectName);
    localStorage.setItem('selectedCSRPartnerId', csrPartnerId);
    localStorage.setItem('selectedCSRPartnerName', csrPartnerName);
    localStorage.setItem('selectedProjectRole', projectRole);
  };

  const handleClearSelectedProject = () => {
    setProjectId(null);
    setProjectName(null);
    setCSRPartnerId(null);
    setCSRPartnerName(null);
    setProjectRole(null);

    // Clear from localStorage
    localStorage.removeItem('selectedProjectId');
    localStorage.removeItem('selectedProjectName');
    localStorage.removeItem('selectedCSRPartnerId');
    localStorage.removeItem('selectedCSRPartnerName');
    localStorage.removeItem('selectedProjectRole');
  };

  const value: SelectedProjectContext = {
    projectId,
    projectName,
    csrPartnerId,
    csrPartnerName,
    projectRole,
    setSelectedProject: handleSetSelectedProject,
    clearSelectedProject: handleClearSelectedProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectContext };
