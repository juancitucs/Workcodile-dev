import { useState, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { RightSidebar } from './right-sidebar';
import { CreatePostModal } from './create-post-modal';
import { useApp } from './app-context';
import { Sheet, SheetContent } from './ui/sheet';

export function MainLayout() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { searchPosts, resetMainFeed } = useApp();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'commented'>('recent');
  const [resetKey, setResetKey] = useState(0); // Key to force remount of sidebars

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

  // Reset all filters to initial state
  const resetAllFilters = useCallback(() => {
    setSelectedCourse('all');
    setSearchQuery('');
    setSortBy('recent');
    setIsMobileMenuOpen(false);
    setResetKey(prev => prev + 1); // Increment key to force remount sidebars
    navigate('/');
    resetMainFeed();
  }, [navigate, resetMainFeed]);

  return (
    <div className="min-h-screen workcodile-bg">
      <Header
        onCreatePost={handleCreatePost}
        onSearch={handleSearch}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        onResetFilters={resetAllFilters}
      />

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar
            key={`mobile-sidebar-${resetKey}`}
            selectedCourse={selectedCourse}
            onCourseSelect={handleCourseSelect}
            sortBy={sortBy}
            onSortChange={setSortBy}
            className="h-full"
          />
        </SheetContent>
      </Sheet>

      <main className="container max-w-[1800px] mx-auto px-4 py-2">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block sidebar-border-right"
            style={{ width: '22%', flexShrink: 0 }}
          >
            <div className="sticky top-20 sidebar-scroll sidebar-scroll-left max-h-[calc(100vh-120px)] overflow-y-auto pr-3">
              <Sidebar
                key={`desktop-sidebar-${resetKey}`}
                selectedCourse={selectedCourse}
                onCourseSelect={setSelectedCourse}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 lg:w-[56%]"
          >
            <Outlet context={{ setSelectedCourse, setSearchQuery, selectedCourse, searchQuery, sortBy, setSortBy }} />
          </motion.div>

          {/* Right Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block sidebar-border-left"
            style={{ width: '22%', flexShrink: 0 }}
          >
            <div className="sticky top-20 sidebar-scroll max-h-[calc(100vh-120px)] overflow-y-auto pl-3">
              <RightSidebar key={`right-sidebar-${resetKey}`} />
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
