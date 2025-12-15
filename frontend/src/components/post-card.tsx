import MarkdownRenderer from './markdown-renderer';
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { useApp } from './app-context'
import { PostActions } from './post-actions'
import { WorkCodileLogo } from './crocodile-icon'
import { UserProfile } from './user-profile'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
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
  Download,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { CommentTree } from './comment-tree'
import { formatFileSize, getFileIcon, getAttachmentUrl } from './file-utils'
import { CreateCommentForm } from './CreateCommentForm'; // NEW IMPORT

interface PostCardProps {
  post: Post
  startWithCommentsOpen?: boolean
  highlightCommentId?: string
  isDashboardView?: boolean // Add this line
}

const getCycleColor = (cycle: number) => {
  // Returns CSS class for cycle background color
  // Blue gradient scale: lighter for lower cycles, darker for higher cycles
  return `cycle-${cycle}-bg`;
};

// Get text color class for cycle badge based on cycle number
const getCycleTextColor = (cycle: number) => {
  return `cycle-${cycle}-text`;
};



export function PostCard({ post, startWithCommentsOpen = false, highlightCommentId, isDashboardView }: PostCardProps) {
  const navigate = useNavigate()
  const contentRef = useRef<HTMLDivElement>(null); // Ref for content measurement
  const [isContentTruncated, setIsContentTruncated] = useState(false); // State to control "Ver más" visibility
  const {
    votePost,
    addComment,
    voteComment,
    user,
    getCourseById,
    toggleBookmark,
    reportPost,
    incrementViews,
  } = useApp()
  const [showComments, setShowComments] = useState(startWithCommentsOpen)

  const [showProfile, setShowProfile] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    if (isDashboardView && contentRef.current) {
      // Use requestAnimationFrame to ensure DOM is fully rendered after potential updates
      const checkTruncation = () => {
        if (contentRef.current) {
          const { scrollHeight, clientHeight } = contentRef.current;
          setIsContentTruncated(scrollHeight > clientHeight);
        }
      };

      // Run immediately and also on window resize (debounced)
      const resizeObserver = new ResizeObserver(checkTruncation);
      resizeObserver.observe(contentRef.current);

      // Also run on mount/update for initial check
      checkTruncation();

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [post.content, isDashboardView]); // Re-run if content or dashboard view changes

  const handleShowProfile = (userId: string) => {
    setSelectedUserId(userId)
    setShowProfile(true)
  }

  const handleNavigate = () => {
    navigate(`/post/${post.id}`)
  }

  const handleVote = (vote: 'up' | 'down') => {
    votePost(post.id, vote)
  }

  const handleCommentVote = (commentId: string, vote: 'up' | 'down') => {
    voteComment(post.id, commentId, vote)
  }



  const handleBookmark = () => {
    toggleBookmark(post.id)
  }

  const handleReport = () => {
    reportPost(post.id)
  }

  const handleDownload = (e: React.MouseEvent, attachment: FileAttachment) => {
    e.stopPropagation()
    const downloadUrl = getAttachmentUrl(attachment);
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    } else {
      console.error('Could not get download URL for attachment:', attachment);
      // Optionally, show a user-friendly error message
    }
  }

  const netScore = post.upvotes - post.downvotes
  const course = getCourseById(post.course)

  return (
    <>
      <div
        id={`post-${post.id}`}
        className={`cursor-pointer ${isDashboardView ? '' : 'max-w-3xl mx-auto'}`}
        onClick={handleNavigate}
      >
        <Card className="glass-card gradient-border shadow-modern hover:shadow-modern-lg transition-all duration-300 ease-out">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div
                className="flex items-center space-x-3"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShowProfile(post.author.id)
                }}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={post.author.avatar}
                    alt={post.author.name}
                  />
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
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                    {course && (
                      <Badge
                        variant="secondary"
                        className={`${getCycleColor(course.cycle)} ${getCycleTextColor(course.cycle)} text-xs flex items-center space-x-1`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GraduationCap className="h-3 w-3" />
                        <span>Ciclo {course.cycle}</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex flex-row space-x-4">
              {/* Vote buttons */}
              <div className="flex flex-col items-center space-y-1"> {/* Changed items-center to items-start */}
                <Button
                  variant={post.userVote === 'up' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVote('up')
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>

                <span
                  className={`text-sm w-8 font-medium text-center ${netScore > 0
                    ? 'text-primary'
                    : netScore < 0
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                    }`}
                >
                  {netScore}
                </span>

                <Button
                  variant={post.userVote === 'down' ? 'destructive' : 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleVote('down')
                  }}
                  className="h-8 w-8 p-0"
                >
                  {' '}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Post content */}
              <div className="flex-1 min-w-[200px] sm:min-w-0">
                {course && (
                  <div className="flex items-center space-x-2 text-xs text-primary mb-2">
                    <GraduationCap className="h-3 w-3" />
                    <span className="font-medium">{course.id}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{course.name}</span>
                  </div>
                )}
                <Link
                  to={`/post/${post.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-semibold text-lg mb-2 leading-tight hover:underline">
                    {post.title}
                  </h3>
                </Link>
                <div ref={contentRef} className={`prose prose-sm dark:prose-invert max-w-none mb-3 ${isDashboardView ? 'max-h-64 overflow-hidden relative' : ''}`}>
                  <MarkdownRenderer attachments={post.attachments}>{post.content}</MarkdownRenderer>
                  {isDashboardView && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none"></div>
                  )}
                </div>

                {isDashboardView && isContentTruncated && (
                  <Link to={`/post/${post.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="link" size="sm" className="-ml-3 mt-1">
                      Ver más
                    </Button>
                  </Link>
                )}

                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.hashtags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* File Attachments */}
                {post.attachments.length > 0 && (
                  <Accordion type="single" collapsible className="w-full mb-4">
                    <AccordionItem value="attachments">
                      <AccordionTrigger>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Paperclip className="h-4 w-4" />
                          <span>
                            {post.attachments.length} archivo
                            {post.attachments.length > 1 ? 's' : ''} adjunto
                            {post.attachments.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {post.attachments.map((attachment, index) => (
                            <div
                              key={`${index}-${attachment.name}`}
                              onClick={(e) =>
                                handleDownload(e, attachment)
                              }
                            >
                              <motion.div
                                whileHover={{ scale: 1.02, y: -1 }}
                                transition={{
                                  duration: 0.2,
                                  ease: [0.4, 0, 0.2, 1],
                                }}
                                className="flex items-center space-x-2 p-3 bg-gradient-to-r from-workcodile-gray-light/50 to-workcodile-gray-subtle/30 border border-workcodile-border-light rounded-md hover:from-workcodile-green-subtle/30 hover:to-workcodile-gray-subtle/50 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                              >
                                <span className="text-sm">
                                  {getFileIcon(attachment.type)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-primary/10"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </motion.div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                {/* Action buttons */}
                <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                  <PostActions
                    postId={post.id}
                    postTitle={post.title}
                    commentsCount={post.comments.length}
                    viewsCount={post.views}
                    isBookmarked={post.isBookmarked}
                    onToggleComments={() => setShowComments(!showComments)}
                    onBookmark={handleBookmark}
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
                      <CreateCommentForm
                        postId={post.id}
                        onCommentSubmitted={() => {
                          // This callback can be used to refresh comments or update the UI
                          // after a top-level comment has been successfully submitted.
                          // For now, it just logs.
                          console.log('Top-level comment submitted');
                          // A more advanced implementation might reset the main feed or fetch comments
                        }}
                      />
                    )}

                    {/* Comments list */}
                    <CommentTree
                      comments={post.comments}
                      postId={post.id}
                      onCommentVote={handleCommentVote}
                      highlightCommentId={highlightCommentId}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {showProfile && (
        <UserProfile
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          userId={selectedUserId!}
        />
      )}
    </>
  )
}