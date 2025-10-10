import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { RightSidebar } from './right-sidebar';
import { MobileCourseFilter } from './mobile-course-filter';
import { PostCard } from './post-card';
import { CreatePostModal } from './create-post-modal';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useApp } from './app-context';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  TrendingUp, 
  Clock, 
  MessageCircle, 
  Filter,
  RefreshCw
} from 'lucide-react';

type SortOption = 'recent' | 'popular' | 'commented';

export function MainFeed() {
  const { posts, searchPosts, getCourseById, mainFeedKey } = useApp();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedPosts = useMemo(() => {
    let filteredPosts = searchQuery ? searchPosts(searchQuery) : posts;
    
    // Filter by course
    if (selectedCourse !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.course === selectedCourse);
    }

    // Sort posts
    const sortedPosts = [...filteredPosts].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        case 'commented':
          return b.comments.length - a.comments.length;
        case 'recent':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return sortedPosts;
  }, [posts, selectedCourse, sortBy, searchQuery, searchPosts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRefresh = () => {
    // In a real app, this would refetch data
    window.location.reload();
  };

  const sortOptions = [
    { value: 'recent', label: 'Más recientes', icon: Clock },
    { value: 'popular', label: 'Más populares', icon: TrendingUp },
    { value: 'commented', label: 'Más comentados', icon: MessageCircle }
  ];

  return (
    <div className="min-h-screen workcodile-bg">
      <Header 
        onCreatePost={() => setIsCreatePostOpen(true)}
        onSearch={handleSearch}
      />
      
      <main className="container max-w-[1400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Hidden on mobile */}
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
            className="lg:col-span-6 xl:col-span-6 col-span-full space-y-6"
          >
            {/* Mobile Course Filter */}
            <MobileCourseFilter
              selectedCourse={selectedCourse}
              onCourseSelect={setSelectedCourse}
              postsCount={filteredAndSortedPosts.length}
            />

            {/* Feed Controls */}
            <Card className="glass-card gradient-border shadow-modern p-5 fade-in-up">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedCourse === 'all' ? 'Todas las publicaciones' : 
                     (() => {
                       const course = getCourseById(selectedCourse);
                       return course ? `${course.id} - Ciclo ${course.cycle}` : 'Curso seleccionado';
                     })()}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredAndSortedPosts.length} publicaciones
                    {searchQuery && ` • Buscando: "${searchQuery}"`}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefresh}
                    className="hidden sm:flex"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </div>
              </div>
            </Card>



            {/* Posts Feed */}
            <div className="space-y-4">
              {filteredAndSortedPosts.length > 0 ? (
                filteredAndSortedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <Card className="glass-card p-8 border-dashed shadow-modern-lg">
                    <div className="max-w-md mx-auto">
                      <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {searchQuery ? 'No se encontraron resultados' : 'No hay publicaciones'}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery 
                          ? `No se encontraron publicaciones que coincidan con "${searchQuery}"`
                          : selectedCourse === 'all'
                          ? 'Sé el primero en crear una publicación'
                          : `No hay publicaciones en el curso seleccionado`
                        }
                      </p>
                      {!searchQuery && (
                        <Button onClick={() => setIsCreatePostOpen(true)}>
                          Crear primera publicación
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Load More (placeholder for future pagination) */}
            {filteredAndSortedPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center py-8"
              >
                <Button variant="outline" className="w-full max-w-sm">
                  Cargar más publicaciones
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Right Sidebar - Shown on all sizes */}
          <motion.aside
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 xl:col-span-3 col-span-full"
          >
            <div className="sticky top-24 sidebar-scroll max-h-[calc(100vh-120px)] overflow-y-auto">
              <RightSidebar />
            </div>
          </motion.aside>
        </div>
      </main>

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
    </div>
  );
}