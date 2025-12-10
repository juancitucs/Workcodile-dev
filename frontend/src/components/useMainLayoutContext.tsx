import { useOutletContext } from 'react-router-dom';

type ContextType = {
  setSelectedCourse: (course: string) => void;
  setSearchQuery: (query: string) => void;
  selectedCourse: string;
  searchQuery: string;
};

export function useMainLayoutContext() {
  return useOutletContext<ContextType>();
}
