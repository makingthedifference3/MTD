import { useContext } from 'react';
import { FilterContext } from './FilterContext';
import type { FilterContextType } from './FilterContext';

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider');
  }
  return context;
};
