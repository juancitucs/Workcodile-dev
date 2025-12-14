import { useOutletContext } from 'react-router-dom';

type ContextType = {
  setSelectedCourse: (course: string) => void;
  setSearchQuery: (query: string) => void;
  selectedCourse: string;
  searchQuery: string;
  sortBy: 'recent' | 'popular' | 'commented';
  setSortBy: (sort: 'recent' | 'popular' | 'commented') => void;
};

export function useMainLayoutContext() {
  return useOutletContext<ContextType>();
}
