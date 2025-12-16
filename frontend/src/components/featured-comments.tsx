import { useMemo, memo, useDeferredValue } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useApp } from './app-context';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const FeaturedComments = memo(function FeaturedComments() {
  const { posts } = useApp();

  const rawRecentComments = useMemo(() => {
    const allComments = posts.flatMap(post =>
      post.comments.map(comment => ({ ...comment, postId: post.id, postTitle: post.title }))
    );
    return allComments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [posts]);

  // Defer the expensive calculation
  const recentComments = useDeferredValue(rawRecentComments);

  return (
    <motion.div>
      <Card>
        <CardContent className="space-y-4 pt-4">
          {recentComments.map((comment) => (
            <Link
              to={`/post/${comment.postId}#comment-${comment.id}`}
              key={comment.id}
              className="block group"
            >
              <div className="sidebar-item flex items-start space-x-3 p-3 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm flex items-center justify-between">
                    <span className="sidebar-item-title font-medium truncate text-primary">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 italic">
                    "{comment.content}"
                  </p>
                  <p className="text-xs text-foreground mt-2 truncate">
                    en: <span className="font-medium group-hover:underline">{comment.postTitle}</span>
                  </p>
                </div>
                <ChevronRight className="sidebar-item-icon h-4 w-4 text-muted-foreground self-center transition-colors" />
              </div>
            </Link>
          ))}
          {recentComments.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay comentarios recientes.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
