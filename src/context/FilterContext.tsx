import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { CSRPartner, Project } from '../services/filterService';
import { fetchCSRPartners, fetchAllProjects } from '../services/filterService';

interface FilterContextType {
  selectedPartner: string | null;
  selectedProject: string | null;
  csrPartners: CSRPartner[];
  projects: Project[];
  filteredProjects: Project[];
  isLoading: boolean;
  error: string | null;
  setSelectedPartner: (partnerId: string | null) => void;
  setSelectedProject: (projectId: string | null) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export { FilterContext, type FilterContextType };

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [csrPartners, setCSRPartners] = useState<CSRPartner[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
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

  const resetFilters = () => {
    setSelectedPartner(null);
    setSelectedProject(null);
  };

  return (
    <FilterContext.Provider
      value={{
        selectedPartner,
        selectedProject,
        csrPartners,
        projects,
        filteredProjects,
        isLoading,
        error,
        setSelectedPartner,
        setSelectedProject,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};


