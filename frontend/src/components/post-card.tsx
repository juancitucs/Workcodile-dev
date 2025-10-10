import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { useApp } from './app-context';
import { PostActions } from './post-actions';
import { CompactCrocodileRating } from './crocodile-rating';
import { WorkCodileLogo } from './crocodile-icon';
import { 
  ChevronUp, 
  ChevronDown, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Clock,
  GraduationCap,
  Hash,
  Paperclip,
  Download
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CommentTree } from './comment-tree';

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    university: string;
  };
  createdAt: Date;
  course: string;
  upvotes: number;
  downvotes: number;
  comments: Array<{
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      university: string;
    };
    createdAt: Date;
    upvotes: number;
    downvotes: number;
    userVote?: 'up' | 'down';
  }>;
  userVote?: 'up' | 'down';
  hashtags: string[];
  attachments: FileAttachment[];
  rating: number;
  totalRatings: number;
  userRating?: number;
  views: number;
  isBookmarked?: boolean;
}

interface PostCardProps {
  post: Post;
}

const getCycleColor = (cycle: number) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
  ];
  return colors[(cycle - 1) % colors.length];
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.includes('image/')) return '🖼️';
  if (type.includes('pdf')) return '📄';
  if (type.includes('zip') || type.includes('rar')) return '📦';
  if (type.includes('word')) return '📝';
  return '📄';
};

export function PostCard({ post }: PostCardProps) {
  const { 
    votePost, 
    addComment, 
    voteComment, 
    user, 
    getCourseById, 
    ratePost, 
    toggleBookmark, 
    reportPost, 
    incrementViews, 
    selectPost 
  } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [hasIncrementedViews, setHasIncrementedViews] = useState(false);

  const handleVote = (vote: 'up' | 'down') => {
    votePost(post.id, vote);
  };

  const handleCommentVote = (commentId: string, vote: 'up' | 'down') => {
    voteComment(post.id, commentId, vote);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    addComment(post.id, newComment);
    setNewComment('');
    setIsSubmittingComment(false);
  };

  const handleRate = (rating: number) => {
    ratePost(post.id, rating);
  };

  const handleBookmark = () => {
    toggleBookmark(post.id);
  };

  const handleReport = () => {
    reportPost(post.id);
  };

  // Increment views when component mounts (simulate viewing the post)
  useEffect(() => {
    if (!hasIncrementedViews) {
      incrementViews(post.id);
      setHasIncrementedViews(true);
    }
  }, [post.id, incrementViews, hasIncrementedViews]);

  const netScore = post.upvotes - post.downvotes;
  const course = getCourseById(post.course);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Prevent navigation when clicking on interactive elements
    if (target.closest('button, a, [role="button"], [data-collapsible-trigger]')) {
      return;
    }
    selectPost(post.id);
  };

  return (
    <motion.div
      id={`post-${post.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="hover-lift cursor-pointer"
      onClick={handleCardClick}
    >
      <Card className="glass-card gradient-border shadow-modern hover:shadow-modern-lg transition-all duration-300 ease-out">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback className="bg-primary/10">
                  {post.author.avatar ? (
                    post.author.name.charAt(0).toUpperCase()
                  ) : (
                    <WorkCodileLogo className="h-6 w-6" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{post.author.name}</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(post.createdAt, { 
                      addSuffix: true,
                      locale: es 
                    })}
                  </span>
                  {course && (
                    <Badge 
                      variant="secondary" 
                      className={`${getCycleColor(course.cycle)} text-white text-xs flex items-center space-x-1`}
                    >
                      <GraduationCap className="h-3 w-3" />
                      <span>Ciclo {course.cycle}</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex space-x-4">
            {/* Vote buttons */}
            <div className="flex flex-col items-center space-y-1 min-w-0">
              <Button
                variant={post.userVote === 'up' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleVote('up')}
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              
              <span className={`text-sm font-medium ${
                netScore > 0 ? 'text-primary' : 
                netScore < 0 ? 'text-destructive' : 
                'text-muted-foreground'
              }`}>
                {netScore}
              </span>
              
              <Button
                variant={post.userVote === 'down' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleVote('down')}
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Post content */}
            <div className="flex-1 min-w-0">
              {course && (
                <div className="flex items-center space-x-2 text-xs text-primary mb-2">
                  <GraduationCap className="h-3 w-3" />
                  <span className="font-medium">{course.id}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{course.name}</span>
                </div>
              )}
              <h3 className="font-semibold text-lg mb-2 leading-tight">
                {post.title}
              </h3>
              <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Hashtags */}
              {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.hashtags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* File Attachments */}
              {post.attachments.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {post.attachments.length} archivo{post.attachments.length > 1 ? 's' : ''} adjunto{post.attachments.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {post.attachments.map((attachment) => (
                      <motion.div
                        key={attachment.id}
                        whileHover={{ scale: 1.02, y: -1 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="flex items-center space-x-2 p-3 bg-gradient-to-r from-workcodile-gray-light/50 to-workcodile-gray-subtle/30 border border-workcodile-border-light rounded-md hover:from-workcodile-green-subtle/30 hover:to-workcodile-gray-subtle/50 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <span className="text-sm">{getFileIcon(attachment.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-primary/10"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating display */}
              {post.totalRatings > 0 && (
                <div className="mb-3 pb-3 border-b border-border/50">
                  <CompactCrocodileRating
                    rating={post.rating}
                    totalRatings={post.totalRatings}
                    size="sm"
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="mb-4">
                <PostActions
                  postId={post.id}
                  postTitle={post.title}
                  commentsCount={post.comments.length}
                  viewsCount={post.views}
                  isBookmarked={post.isBookmarked}
                  rating={post.rating}
                  totalRatings={post.totalRatings}
                  userRating={post.userRating}
                  onToggleComments={() => setShowComments(!showComments)}
                  onBookmark={handleBookmark}
                  onRate={handleRate}
                  onReport={handleReport}
                />
              </div>

              {/* Comments section */}
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  {/* Add comment form */}
                  {user && (
                    <form onSubmit={handleAddComment} className="space-y-2">
                      <Textarea
                        placeholder="Escribe un comentario..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          size="sm"
                          disabled={!newComment.trim() || isSubmittingComment}
                        >
                          {isSubmittingComment ? 'Enviando...' : 'Comentar'}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Comments list */}
                  <CommentTree comments={post.comments} postId={post.id} onCommentVote={handleCommentVote} />
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}