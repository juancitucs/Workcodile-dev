import { useMemo, useEffect, useRef, forwardRef } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useApp } from './app-context';
import { PostCard } from './post-card';
import { Virtuoso } from 'react-virtuoso';
import { MobileCourseFilter } from './mobile-course-filter';
import { useMainLayoutContext } from './useMainLayoutContext';
import {
  MessageCircle
} from 'lucide-react';
import { Post } from './types';
import { PostCardSkeletonList } from './post-card-skeleton';

const CustomList = forwardRef(({ children, ...props }: { children: React.ReactNode }, ref: React.ForwardedRef<HTMLDivElement>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { visibleItemsChanged, ...rest } = props;
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
});
CustomList.displayName = 'CustomList';



export function MainFeed() {
  const {
    posts,
    searchPosts,
    getCoursesByCycle,
    fetchMorePosts,
    hasMorePosts,
    isFetchingPosts,
    incrementViewsBatch
  } = useApp();
  const { selectedCourse, setSelectedCourse, searchQuery, sortBy } =
    useMainLayoutContext();
  // Remove sortBy state as it's managed by MainLayout now

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
    if (selectedCourse === 'bookmarks') {
      filtered = filtered.filter(post => post.isBookmarked);
    } else if (selectedCourse !== 'all') {
      if (selectedCourse.startsWith('cycle-')) {
        const cycle = parseInt(selectedCourse.split('-')[1], 10);
        const cycleCourses = getCoursesByCycle(cycle).map(c => c.id);
        filtered = filtered.filter(post => cycleCourses.includes(post.course));
      } else {
        filtered = filtered.filter(post => post.course === selectedCourse);
      }
    }
    return filtered;
  }, [posts, selectedCourse, searchQuery, searchPosts, getCoursesByCycle]);

  const filteredAndSortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
        case 'commented':
          return b.comments.length - a.comments.length;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [filteredPosts, sortBy]);





  const loadMore = () => {
    if (hasMorePosts) {
      fetchMorePosts();
    }
  };

  return (
    <div className="space-y-6">
      <MobileCourseFilter
        selectedCourse={selectedCourse}
        onCourseSelect={setSelectedCourse}
        postsCount={filteredAndSortedPosts.length}
      />

      {/* Filter controls moved to sidebar */}

      {filteredAndSortedPosts.length > 0 ? (
        <Virtuoso
          useWindowScroll
          data={filteredAndSortedPosts}
          endReached={loadMore}
          itemContent={(index, post) => (
            <div className="pb-4">
              <PostCard post={post} isDashboardView={true} />
              <hr className="post-divider" />
            </div>
          )}
          visibleItemsChanged={handleVisibleItemsChange}
          components={{
            List: CustomList,
            Footer: () => (
              <div className="text-center py-8">
                {isFetchingPosts ? (
                  <PostCardSkeletonList count={2} />
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
            )
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
                {searchQuery ? 'No se encontraron resultados' : selectedCourse === 'bookmarks' ? 'No tienes marcadores' : 'No hay publicaciones'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? `No se encontraron publicaciones que coincidan con "${searchQuery}"`
                  : selectedCourse === 'bookmarks'
                    ? 'Guarda publicaciones para verlas aquí'
                    : selectedCourse === 'all'
                      ? 'Sé el primero en crear una publicación'
                      : `No hay publicaciones en el curso seleccionado`
                }
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}