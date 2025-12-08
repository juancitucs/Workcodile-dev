import { useState, useMemo, forwardRef, memo, useDeferredValue } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from './app-context';
import { WorkCodileLogo } from './crocodile-icon';
import { 
  Clock, 
  MessageSquare, 
  Plus,
  Star,
  TrendingUp,
  TrendingDown,
  FileText,
  Hash,
  ChevronRight,
  Activity,
  Zap
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

      // Add comment activities
      post.comments.forEach(comment => {
        items.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          timestamp: new Date(comment.createdAt),
          user: comment.author,
          post: {
            id: post.id,
            title: post.title,
            course: post.course
          },
          details: {
            commentText: comment.content
          }
        });
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
      case 'comment': return <MessageSquare className="h-3 w-3" />;
      case 'vote': return <TrendingUp className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post': return 'text-blue-500';
      case 'comment': return 'text-green-500';
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
      case 'comment':
        return (
          <div>
            <span className="text-primary font-medium">{item.user.name.split(' ')[0]}</span>
            <span className="text-muted-foreground"> comentó en </span>
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
            className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-all duration-200 cursor-pointer"
          >
            <div className="flex-shrink-0">
              <div className={`p-1.5 rounded-full bg-muted/50 ${getActivityColor(item.type)}`}>
                {getActivityIcon(item.type)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm mb-1">
                {getActivityText(item)}
              </div>
              
              <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {item.post.title}
              </p>
              
              {item.details?.commentText && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                  "{item.details.commentText}"
                </p>
              )}
              
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:inline">Actividad Reciente</span>
            <span className="sm:hidden">⚡ Actividad</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4">
              <TabsList className="flex items-center -mb-px border-b border-border">
                <TabsTrigger value="all" className="text-xs sm:text-sm whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary">
                  Todo
                </TabsTrigger>
                <TabsTrigger value="post" className="text-xs sm:text-sm whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="comment" className="text-xs sm:text-sm whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary">
                  Comentarios
                </TabsTrigger>
                <TabsTrigger value="vote" className="text-xs sm:text-sm whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary">
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
