import { useState, useCallback } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { RightSidebar } from './right-sidebar';
import { CreatePostModal } from './create-post-modal';
import { useApp } from './app-context';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

type ContextType = { 
  setSelectedCourse: (course: string) => void; 
  setSearchQuery: (query: string) => void;
  selectedCourse: string;
  searchQuery: string;
};

export function useMainLayoutContext() {
  return useOutletContext<ContextType>();
}

export function MainLayout() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { searchPosts } = useApp();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    searchPosts(query);
  }, [searchPosts, setSearchQuery]);

  const handleCreatePost = useCallback(() => {
    setIsCreatePostOpen(true);
  }, []);

  const handleCourseSelect = (course: string) => {
    setSelectedCourse(course);
    setIsMobileMenuOpen(false); // Close mobile menu on selection
  };

  return (
    <div className="min-h-screen workcodile-bg">
      <Header 
        onCreatePost={handleCreatePost}
        onSearch={handleSearch}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />
      
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar 
            selectedCourse={selectedCourse}
            onCourseSelect={handleCourseSelect}
            className="h-full"
          />
        </SheetContent>
      </Sheet>

      <main className="container max-w-[1400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 xl:col-span-3 hidden lg:block"
          >
            <div className="sticky top-24 sidebar-scroll max-h-[calc(100vh-120px)] overflow-y-auto">
              <Sidebar 
                selectedCourse={selectedCourse}
                onCourseSelect={setSelectedCourse}
              />
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-6 xl:col-span-6 col-span-full"
          >
            <Outlet context={{ setSelectedCourse, setSearchQuery, selectedCourse, searchQuery }} />
          </motion.div>

          {/* Right Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 xl:col-span-3 hidden lg:block"
          >
            <div className="sticky top-24 sidebar-scroll max-h-[calc(100vh-120px)] overflow-y-auto">
              <RightSidebar />
            </div>
          </motion.aside>
        </div>
      </main>

      <CreatePostModal 
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
    </div>
  );
}
