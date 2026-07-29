import { useState, useMemo, forwardRef, memo, useDeferredValue } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from './app-context';
import {
  Plus,
  TrendingUp,
  ChevronRight,
  Activity,
} from 'lucide-react';

interface RecentActivityProps {
  onUserClick?: (userId: string) => void;
}

interface ActivityItem {
  id: string;
  type: 'post' | 'comment' | 'vote';
  timestamp: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  post: {
    id: string;
    title: string;
    course: string;
  };
  details?: {
    voteType?: 'up' | 'down';
    commentText?: string;
  };
}

export const RecentActivity = memo(function RecentActivity({ onUserClick }: RecentActivityProps) {
  const { posts, getCourseById } = useApp();
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Generate activity items from posts and comments
  const rawActivityItems = useMemo(() => {
    const items: ActivityItem[] = [];

    // Add post creation activities
    posts.forEach(post => {
      items.push({
        id: `post-${post.id}`,
        type: 'post',
        timestamp: new Date(post.createdAt),
        user: post.author,
        post: {
          id: post.id,
          title: post.title,
          course: post.course
        }
      });

      // Simulate vote activities
      if (post.upvotes > 0) {
        items.push({
          id: `upvote-${post.id}`,
          type: 'vote',
          timestamp: new Date(new Date(post.createdAt).getTime() + Math.random() * 12 * 60 * 60 * 1000),
          user: post.author, // In reality, this would be different users voting
          post: {
            id: post.id,
            title: post.title,
            course: post.course
          },
          details: {
            voteType: 'up'
          }
        });
      }
    });
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [posts]);

  // Defer the expensive calculation
  const activityItems = useDeferredValue(rawActivityItems);

  const filteredActivities = useMemo(() => {
    let filtered = activityItems;

    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.type === activeTab);
    }

    return showAll ? filtered : filtered.slice(0, 10);
  }, [activityItems, activeTab, showAll]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return <Plus className="h-3 w-3" />;
      case 'vote': return <TrendingUp className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post': return 'text-blue-500';
      case 'vote': return 'text-purple-500';
      default: return 'text-muted-foreground';
    }
  };

  const getActivityText = (item: ActivityItem) => {
    const course = getCourseById(item.post.course);
    const courseName = course ? course.id : item.post.course;

    switch (item.type) {
      case 'post':
        return (
          <div>
            <span className="text-primary font-medium">{item.user.name.split(' ')[0]}</span>
            <span className="text-muted-foreground"> creó una nueva publicación en </span>
            <Badge variant="secondary" className="text-xs mx-1">{courseName}</Badge>
          </div>
        );
      case 'vote':
        return (
          <div>
            <span className="text-primary font-medium">{item.user.name.split(' ')[0]}</span>
            <span className="text-muted-foreground"> votó </span>
            <span className={item.details?.voteType === 'up' ? 'text-green-500' : 'text-red-500'}>
              {item.details?.voteType === 'up' ? '↑' : '↓'}
            </span>
            <span className="text-muted-foreground"> en </span>
            <Badge variant="secondary" className="text-xs mx-1">{courseName}</Badge>
          </div>
        );
      default:
        return null;
    }
  };

  const ActivityItem = forwardRef<HTMLDivElement, { item: ActivityItem; index: number }>(
    ({ item, index }, ref) => {
      const linkTo = item.type === 'comment'
        ? `/post/${item.post.id}#comment-${item.id}`
        : `/post/${item.post.id}`;

      return (
        <Link to={linkTo}>
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: 0.03 * index }}
            className="sidebar-item group flex items-start space-x-3 p-3 cursor-pointer"
          >
            <div className="flex-shrink-0">
              <div className={`sidebar-item-icon p-1.5 rounded-full bg-muted/50 ${getActivityColor(item.type)}`}>
                {getActivityIcon(item.type)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm mb-1">
                {getActivityText(item)}
              </div>

              <p className="sidebar-item-title text-sm font-medium text-foreground line-clamp-2 transition-colors">
                {item.post.title}
              </p>

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(item.timestamp)}
                </span>
                <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </motion.div>
        </Link>
      );
    }
  );

  ActivityItem.displayName = 'ActivityItem';

  const getTabCount = (type: string) => {
    if (type === 'all') return activityItems.length;
    return activityItems.filter(item => item.type === type).length;
  };

  return (
    <motion.div>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4">
              <TabsList className="flex items-center w-full justify-around -mb-px border-b border-border">
                <TabsTrigger value="all" className="flex-1 text-xs sm:text-sm whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary cursor-pointer">
                  Todo
                </TabsTrigger>
                <TabsTrigger value="post" className="flex-1 text-xs sm:text-sm whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary cursor-pointer">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="vote" className="flex-1 text-xs sm:text-sm whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary cursor-pointer">
                  Votos
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="px-4 pb-4 pt-4">
              <TabsContent value={activeTab} className="mt-0">
                {filteredActivities.length > 0 ? (
                  <div className="space-y-1">
                    <AnimatePresence mode="popLayout">
                      {filteredActivities.map((item, index) => (
                        <ActivityItem key={item.id} item={item} index={index} />
                      ))}
                    </AnimatePresence>

                    {!showAll && activityItems.length > 10 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-4 border-t border-border"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAll(true)}
                          className="w-full text-xs"
                        >
                          Ver toda la actividad ({activityItems.length - 10} más)
                        </Button>
                      </motion.div>
                    )}

                    {showAll && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-4 border-t border-border"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAll(false)}
                          className="w-full text-xs"
                        >
                          Mostrar menos
                        </Button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay actividad reciente</p>
                    <p className="text-xs mt-1">de este tipo</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
});
