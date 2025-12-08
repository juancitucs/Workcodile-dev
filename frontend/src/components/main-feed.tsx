import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import React from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { RightSidebar } from './right-sidebar';
import { MobileCourseFilter } from './mobile-course-filter';
import { PostCard } from './post-card';
import { CreatePostModal } from './create-post-modal';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { useApp } from './app-context';
import { Virtuoso } from 'react-virtuoso';
import {
  TrendingUp,
  Clock,
  MessageCircle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Post } from './types'; // Import Post type

type SortOption = 'recent' | 'popular' | 'commented';

export function MainFeed() {
  const { posts, searchPosts, getCourseById, mainFeedKey, fetchMorePosts, hasMorePosts, isFetchingPosts, resetMainFeed, incrementViewsBatch } = useApp();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const viewedPostIdsRef = useRef(new Set<string>());
  const pendingViewBatch = useRef<Set<string>>(new Set());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const processPendingViews = () => {
    if (pendingViewBatch.current.size > 0) {
      const idsToBatch = Array.from(pendingViewBatch.current);
      incrementViewsBatch(idsToBatch);
      idsToBatch.forEach(id => viewedPostIdsRef.current.add(id));
      pendingViewBatch.current.clear();
    }
  };

  const handleVisibleItemsChange = (data: {
    startIndex: number;
    endIndex: number;
    visibleItems: { index: number; data: any }[];
  }) => {
    data.visibleItems.forEach(item => {
      const postId = (posts[item.index] as Post).id;
      if (postId && !viewedPostIdsRef.current.has(postId)) {
        pendingViewBatch.current.add(postId);
      }
    });

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(processPendingViews, 1000);
  };

  const filteredPosts = useMemo(() => {
    let filtered = searchQuery ? searchPosts(searchQuery) : posts;
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(post => post.course === selectedCourse);
    }
    return filtered;
  }, [posts, selectedCourse, searchQuery, searchPosts]);
  const filteredAndSortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
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
  }, [filteredPosts, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRefresh = () => {
    resetMainFeed();
  };

  const sortOptions = [
    { value: 'recent', label: 'Más recientes', icon: Clock },
    { value: 'popular', label: 'Más populares', icon: TrendingUp },
    { value: 'commented', label: 'Más comentados', icon: MessageCircle }
  ];

  const loadMore = () => {
    if (hasMorePosts) {
      fetchMorePosts();
    }
  };

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
            {filteredAndSortedPosts.length > 0 ? (
              <Virtuoso
                style={{ height: '100vh' }}
                data={filteredAndSortedPosts}
                endReached={loadMore}
                itemContent={(index, post) => {
                  return (
                    <div style={{ paddingBottom: '1rem' }}>
                      <PostCard post={post} />
                    </div>
                  );
                }}
                visibleItemsChanged={handleVisibleItemsChange}
                components={{
                  Footer: () => {
                    return (
                      <div className="text-center py-8">
                        {isFetchingPosts ? (
                          <p>Cargando...</p>
                        ) : hasMorePosts ? (
                          <Button
                            variant="outline"
                            className="w-full max-w-sm"
                            onClick={loadMore}
                          >
                            Cargar más publicaciones
                          </Button>
                        ) : (
                          <p>No hay más publicaciones.</p>
                        )}
                      </div>
                    );
                  },
                }}
              />
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