import { createContext, useContext, useState, type ReactNode } from 'react';

interface FilterContextType {
  selectedPartner: string | null;
  selectedProject: string | null;
  setSelectedPartner: (partnerId: string | null) => void;
  setSelectedProject: (projectId: string | null) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const resetFilters = () => {
    setSelectedPartner(null);
    setSelectedProject(null);
  };

  return (
    <FilterContext.Provider
      value={{
        selectedPartner,
        selectedProject,
        setSelectedPartner,
        setSelectedProject,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider');
  }
  return context;
};
