import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './useAuth';
import type { CSRPartner, Project } from '../services/filterService';
import { fetchCSRPartners, fetchAllProjects } from '../services/filterService';
import { getTollsByPartnerId, type Toll } from '../services/tollsService';
import { getUserProjects } from '../services/projectTeamMembersService';

interface FilterContextType {
  selectedPartner: string | null;
  selectedProject: string | null;
  selectedToll: string | null;
  csrPartners: CSRPartner[];
  projects: Project[];
  filteredProjects: Project[];
  tolls: Toll[];
  isLoading: boolean;
  error: string | null;
  filtersLocked: boolean;
  setSelectedPartner: (partnerId: string | null) => void;
  setSelectedProject: (projectId: string | null) => void;
  setSelectedToll: (tollId: string | null) => void;
  resetFilters: () => void;
  refreshData: () => Promise<void>;
  lockFilters: () => void;
  unlockFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const { currentRole, currentUser } = useAuth();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(() => {
    // Admin always starts with no filter
    if (currentRole === 'admin') {
      return null;
    }
    const saved = localStorage.getItem('selectedCSRPartnerId');
    return saved || null;
  });
  const [selectedProject, setSelectedProject] = useState<string | null>(() => {
    const saved = localStorage.getItem('selectedProjectId');
    return saved || null;
  });
  const [selectedToll, setSelectedToll] = useState<string | null>(null);
  const [csrPartners, setCSRPartners] = useState<CSRPartner[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProjectIds, setUserProjectIds] = useState<string[]>([]);
  const [filtersLocked, setFiltersLocked] = useState(false);

  // Persist selectedPartner to localStorage when it changes
  useEffect(() => {
    if (selectedPartner) {
      localStorage.setItem('selectedCSRPartnerId', selectedPartner);
    } else {
      localStorage.removeItem('selectedCSRPartnerId');
    }
  }, [selectedPartner]);

  // Persist selectedProject to localStorage when it changes
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProjectId', selectedProject);
    } else {
      localStorage.removeItem('selectedProjectId');
    }
  }, [selectedProject]);

  // Fetch CSR Partners on mount
  useEffect(() => {
    const loadCSRPartners = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Admin sees all partners regardless, others see only active partners
        const partners = await fetchCSRPartners();
        console.log('FilterContext - Loaded', partners.length, 'CSR partners');
        setCSRPartners(partners);
      } catch (err) {
        console.error('Failed to load CSR partners:', err);
        setError('Failed to load CSR partners');
      } finally {
        setIsLoading(false);
      }
    };

    loadCSRPartners();
  }, []);

  // Fetch user's project assignments
  useEffect(() => {
    const loadUserProjects = async () => {
      if (!currentUser || currentRole === 'admin' || currentRole === 'accountant') {
        // Admin and accountant see all projects
        setUserProjectIds([]);
        return;
      }

      try {
        const projectIds = await getUserProjects(currentUser.id);
        console.log('FilterContext - User assigned to projects:', projectIds);
        setUserProjectIds(projectIds);
      } catch (err) {
        console.error('Failed to load user projects:', err);
        setUserProjectIds([]);
      }
    };

    loadUserProjects();
  }, [currentUser, currentRole]);

  // Fetch all projects on mount
  useEffect(() => {
    const loadAllProjects = async () => {
      try {
        const allProjects = await fetchAllProjects();
        console.log('FilterContext - LoadAllProjects returned:', allProjects.length, 'projects');
        console.log('FilterContext - First 3 projects:', allProjects.slice(0, 3).map(p => ({ id: p.id, name: p.name })));
        
        // Filter projects based on user role
        let visibleProjects = allProjects;
        if (currentRole !== 'admin' && currentRole !== 'accountant' && userProjectIds.length > 0) {
          visibleProjects = allProjects.filter(p => userProjectIds.includes(p.id));
          console.log('FilterContext - Filtered to user projects:', visibleProjects.length);
        }
        
        console.log('FilterContext - Setting projects state to:', visibleProjects.length, 'projects');
        setProjects(visibleProjects);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };

    loadAllProjects();
  }, [currentRole, userProjectIds]);

  // Fetch tolls when partner is selected
  useEffect(() => {
    const loadTolls = async () => {
      if (selectedPartner) {
        try {
          // reset toll selection when partner changes
          setSelectedToll(null);
          const partnerTolls = await getTollsByPartnerId(selectedPartner);
          setTolls(partnerTolls);
        } catch (err) {
          console.error('Failed to load tolls:', err);
          setTolls([]);
        }
      } else {
        setTolls([]);
        setSelectedToll(null);
      }
    };
    loadTolls();
  }, [selectedPartner]);

  // Filter projects based on selected partner, toll, and project
  useEffect(() => {
    let filtered = [...projects];

    console.log('FilterContext - Filtering effect - projects.length:', projects.length, 'currentRole:', currentRole);

    // For admin and accountant with no active selections, show all projects
    // For other roles, apply filters as normal
    if (currentRole === 'admin' || currentRole === 'accountant') {
      // Admin and accountant can see everything unfiltered unless they explicitly select something
      if (selectedPartner) {
        console.log('FilterContext - Filtering with selectedPartner:', selectedPartner);
        filtered = filtered.filter((p) => p.csr_partner_id === selectedPartner);

        if (selectedToll) {
          filtered = filtered.filter((p) => p.toll_id === selectedToll);
        }

        if (selectedProject) {
          filtered = filtered.filter((p) => p.id === selectedProject);
        }
      } else if (selectedProject) {
        console.log('FilterContext - Filtering with selectedProject only:', selectedProject);
        filtered = filtered.filter((p) => p.id === selectedProject);
      } else if (selectedToll) {
        filtered = filtered.filter((p) => p.toll_id === selectedToll);
      }
      // If nothing is selected, show all projects (no filtering)
    } else {
      // For non-admin users, always apply filters
      if (selectedPartner) {
        console.log('FilterContext - Filtering with selectedPartner:', selectedPartner);
        filtered = filtered.filter((p) => p.csr_partner_id === selectedPartner);

        if (selectedToll) {
          filtered = filtered.filter((p) => p.toll_id === selectedToll);
        }

        if (selectedProject) {
          filtered = filtered.filter((p) => p.id === selectedProject);
        }
      } else if (selectedProject) {
        console.log('FilterContext - Filtering with selectedProject only:', selectedProject);
        filtered = filtered.filter((p) => p.id === selectedProject);
      } else if (selectedToll) {
        filtered = filtered.filter((p) => p.toll_id === selectedToll);
      }
    }

    console.log('FilterContext - Final filtered.length:', filtered.length);
    setFilteredProjects(filtered);
  }, [selectedPartner, selectedProject, selectedToll, projects, currentRole]);

  const resetFilters = useCallback(() => {
    if (!filtersLocked) {
      setSelectedPartner(null);
      setSelectedProject(null);
      setSelectedToll(null);
    }
  }, [filtersLocked]);

  const lockFilters = () => {
    setFiltersLocked(true);
  };

  const unlockFilters = () => {
    setFiltersLocked(false);
  };

  // Refresh data from the server
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [partners, allProjects] = await Promise.all([
        fetchCSRPartners(),
        fetchAllProjects(),
      ]);
      setCSRPartners(partners);
      setProjects(allProjects);
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <FilterContext.Provider
      value={{
        selectedPartner,
        selectedProject,
        selectedToll,
        csrPartners,
        projects,
        filteredProjects,
        tolls,
        isLoading,
        error,
        filtersLocked,
        setSelectedPartner,
        setSelectedProject,
        setSelectedToll,
        resetFilters,
        refreshData,
        lockFilters,
        unlockFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export { FilterContext, type FilterContextType };


