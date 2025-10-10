import { useState, useMemo, forwardRef } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from './app-context';
import { WorkCodileLogo } from './crocodile-icon';
import { 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  Star,
  Hash,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';

interface TrendingSectionProps {
  onPostClick?: (postId: string) => void;
}

export function TrendingSection({ onPostClick }: TrendingSectionProps) {
  const { posts, getCourseById } = useApp();
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d'>('24h');

  // Filter posts by time period
  const getPostsByTimeFilter = (timeFilter: '24h' | '7d' | '30d') => {
    const now = new Date();
    const hours = timeFilter === '24h' ? 24 : timeFilter === '7d' ? 168 : 720;
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    return posts.filter(post => post.createdAt >= cutoff);
  };

  const filteredPosts = getPostsByTimeFilter(timeFilter);

  // Trending posts by score (upvotes - downvotes)
  const trendingByScore = useMemo(() => {
    return [...filteredPosts]
      .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
      .slice(0, 5);
  }, [filteredPosts]);

  // Trending by comments
  const trendingByComments = useMemo(() => {
    return [...filteredPosts]
      .sort((a, b) => b.comments.length - a.comments.length)
      .slice(0, 5);
  }, [filteredPosts]);

  // Trending by rating (average rating)
  const trendingByRating = useMemo(() => {
    return [...filteredPosts]
      .filter(post => post.averageRating && post.averageRating > 0)
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 5);
  }, [filteredPosts]);

  // Trending hashtags
  const trendingHashtags = useMemo(() => {
    const hashtagCount: Record<string, number> = {};
    
    filteredPosts.forEach(post => {
      post.hashtags?.forEach(hashtag => {
        hashtagCount[hashtag] = (hashtagCount[hashtag] || 0) + 1;
      });
    });

    return Object.entries(hashtagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([hashtag, count]) => ({ hashtag, count }));
  }, [filteredPosts]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Ahora';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const PostItem = forwardRef<HTMLDivElement, { post: any; index: number; showRating?: boolean }>(
    ({ post, index, showRating = false }, ref) => {
      const course = getCourseById(post.course);
      
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          className="group p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20"
          onClick={() => onPostClick?.(post.id)}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h4>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-2 flex-shrink-0" />
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <div className="flex items-center space-x-2">
              <span>por {post.author.name.split(' ')[0]}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {showRating && post.averageRating && (
                <>
                  <div className="flex items-center space-x-1">
                    <WorkCodileLogo className="w-3 h-3" />
                    <span className="font-medium text-primary">{post.averageRating.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                </>
              )}
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-primary font-medium">+{post.upvotes - post.downvotes}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>{post.comments.length}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            {course && (
              <Badge variant="secondary" className="text-xs">
                {course.id}
              </Badge>
            )}
            
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex items-center space-x-1">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {post.hashtags.slice(0, 2).join(', ')}
                  {post.hashtags.length > 2 && '...'}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      );
    }
  );

  PostItem.displayName = 'PostItem';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <span className="hidden sm:inline">Trending</span>
              <span className="sm:hidden">🔥</span>
            </CardTitle>
            
            <div className="flex items-center space-x-1">
              {(['24h', '7d', '30d'] as const).map((period) => (
                <Button
                  key={period}
                  variant={timeFilter === period ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeFilter(period)}
                  className="h-7 px-1.5 sm:px-2 text-xs"
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="score" className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-1 mx-4 mb-4 h-auto p-1">
              <TabsTrigger value="score" className="text-xs py-2 px-3">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Score</span>
                <span className="sm:hidden">Votos</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className="text-xs py-2 px-3">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Comentarios</span>
                <span className="sm:hidden">Com.</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsList className="grid w-full grid-cols-2 gap-1 mx-4 mb-4 h-auto p-1">
              <TabsTrigger value="rating" className="text-xs py-2 px-3">
                <Star className="h-3 w-3 mr-1" />
                Rating
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="text-xs py-2 px-3">
                <Hash className="h-3 w-3 mr-1" />
                Tags
              </TabsTrigger>
            </TabsList>

            <div className="px-4 pb-4">
              <TabsContent value="score" className="space-y-2 mt-0">
                {trendingByScore.length > 0 ? (
                  trendingByScore.map((post, index) => (
                    <PostItem key={post.id} post={post} index={index} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay posts trending por score</p>
                    <p className="text-xs mt-1">en las últimas {timeFilter}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="space-y-2 mt-0">
                {trendingByComments.length > 0 ? (
                  trendingByComments.map((post, index) => (
                    <PostItem key={post.id} post={post} index={index} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay posts con comentarios</p>
                    <p className="text-xs mt-1">en las últimas {timeFilter}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rating" className="space-y-2 mt-0">
                {trendingByRating.length > 0 ? (
                  trendingByRating.map((post, index) => (
                    <PostItem key={post.id} post={post} index={index} showRating />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay posts calificados</p>
                    <p className="text-xs mt-1">en las últimas {timeFilter}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="hashtags" className="space-y-3 mt-0">
                {trendingHashtags.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {trendingHashtags.map(({ hashtag, count }, index) => (
                        <motion.div
                          key={hashtag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * index }}
                        >
                          <Badge 
                            variant="outline" 
                            className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer group"
                          >
                            <Hash className="h-3 w-3 mr-1" />
                            {hashtag}
                            <span className="ml-1 text-xs bg-muted px-1 rounded group-hover:bg-primary-foreground/20">
                              {count}
                            </span>
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground text-center">
                        {trendingHashtags.reduce((sum, { count }) => sum + count, 0)} mentions totales
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Hash className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay hashtags trending</p>
                    <p className="text-xs mt-1">en las últimas {timeFilter}</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}