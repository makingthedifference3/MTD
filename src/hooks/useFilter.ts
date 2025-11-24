import { useContext } from 'react';
import { FilterContext, type FilterContextType } from '../context/FilterContext';

/**
 * Custom hook to use the Filter context
 * Provides access to filter state and methods for managing selected partner and project
 * Must be used within a FilterProvider
 */
export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
