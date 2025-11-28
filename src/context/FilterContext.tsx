import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CSRPartner, Project } from '../services/filterService';
import { fetchCSRPartners, fetchAllProjects } from '../services/filterService';
import { getTollsByPartnerId, type Toll } from '../services/tollsService';

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
  setSelectedPartner: (partnerId: string | null) => void;
  setSelectedProject: (projectId: string | null) => void;
  setSelectedToll: (tollId: string | null) => void;
  resetFilters: () => void;
  refreshData: () => Promise<void>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export { FilterContext, type FilterContextType };

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedToll, setSelectedToll] = useState<string | null>(null);
  const [csrPartners, setCSRPartners] = useState<CSRPartner[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch CSR Partners on mount
  useEffect(() => {
    const loadCSRPartners = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const partners = await fetchCSRPartners();
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

  // Fetch all projects on mount
  useEffect(() => {
    const loadAllProjects = async () => {
      try {
        const allProjects = await fetchAllProjects();
        console.log('FilterContext - LoadAllProjects returned:', allProjects.length, 'projects');
        console.log('FilterContext - Sample projects:', allProjects.slice(0, 3).map(p => ({ id: p.id, name: p.name, status: p.status, direct_beneficiaries: p.direct_beneficiaries, total_budget: p.total_budget })));
        setProjects(allProjects);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };

    loadAllProjects();
  }, []);

  // Filter projects based on selected partner
  useEffect(() => {
    if (selectedPartner) {
      console.log('FilterContext - Filtering with selectedPartner:', selectedPartner);
      console.log('FilterContext - Total projects available:', projects.length);
      console.log('FilterContext - Sample project csr_partner_ids:', projects.slice(0, 3).map(p => ({ name: p.name, csr_partner_id: p.csr_partner_id })));
      const filtered = projects.filter((p) => p.csr_partner_id === selectedPartner);
      console.log('FilterContext - Filtered projects:', filtered.length);
      setFilteredProjects(filtered);
    } else {
      console.log('FilterContext - No partner selected, showing all projects:', projects.length);
      setFilteredProjects(projects);
    }
  }, [selectedPartner, projects]);

  // Fetch tolls when partner is selected
  useEffect(() => {
    const loadTolls = async () => {
      if (selectedPartner) {
        try {
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

  // Further filter projects by toll if selected
  useEffect(() => {
    if (selectedToll) {
      const tollFiltered = filteredProjects.filter((p) => (p as unknown as { toll_id?: string }).toll_id === selectedToll);
      setFilteredProjects(tollFiltered);
    }
  }, [selectedToll]);

  const resetFilters = () => {
    setSelectedPartner(null);
    setSelectedProject(null);
    setSelectedToll(null);
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
        setSelectedPartner,
        setSelectedProject,
        setSelectedToll,
        resetFilters,
        refreshData,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};


