import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { useApp } from './app-context'
import { WorkCodileLogo } from './crocodile-icon'
import { ChevronUp, ChevronDown, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { CommentTree } from './comment-tree'
import { Comment as CommentType } from './types'
import MarkdownRenderer from './markdown-renderer';
import { CreateCommentForm } from './CreateCommentForm'; // NEW IMPORT

interface CommentProps {
  comment: CommentType
  postId: string
  onCommentVote: (commentId: string, vote: 'up' | 'down') => void
  highlightCommentId?: string;
  depth?: number;
}

const lineColors = [
  'border-blue-500/50 dark:border-blue-400/50',
  'border-green-500/50 dark:border-green-400/50',
  'border-purple-500/50 dark:border-purple-400/50',
  'border-yellow-500/50 dark:border-yellow-400/50',
  'border-red-500/50 dark:border-red-400/50',
];

export function Comment({ comment, postId, onCommentVote, highlightCommentId, depth = 0 }: CommentProps) {
  const { user, fetchCommentReplies } = useApp()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replies, setReplies] = useState<CommentType[]>(comment.replies || []);
  const [areRepliesVisible, setAreRepliesVisible] = useState(false)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (comment.replies) {
      setReplies(comment.replies);
    }
  }, [comment.replies]);

  const isCommentInSubtree = (comments: any[], targetId: string): boolean => {
    for (const c of comments) {
      if (c.id === targetId) {
        return true;
      }
      if (c.replies && c.replies.length > 0) {
        if (isCommentInSubtree(c.replies, targetId)) {
          return true;
        }
      }
    }
    return false;
  };

  useEffect(() => {
    if (comment.id === highlightCommentId) {
      const timer = setTimeout(() => {
        if (commentRef.current) {
          commentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          commentRef.current.classList.add('comment-highlight');
          setTimeout(() => {
            commentRef.current?.classList.remove('comment-highlight');
          }, 2000);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [comment.id, highlightCommentId, areRepliesVisible, replies]);

  useEffect(() => {
    if (highlightCommentId && comment.replies && comment.replies.length > 0) {
      if (isCommentInSubtree(comment.replies, highlightCommentId)) {
        if (!areRepliesVisible) {
          setAreRepliesVisible(true);
        }
      }
    }
  }, [highlightCommentId, comment.replies, areRepliesVisible]);



  const handleLoadReplies = async () => {
    if (isLoadingReplies) return;
    setIsLoadingReplies(true);
    const fetchedReplies = await fetchCommentReplies(postId, comment.id);
    setReplies(fetchedReplies);
    setAreRepliesVisible(true);
    setIsLoadingReplies(false);
  }
  
  const lineColor = lineColors[depth % lineColors.length];

  return (
    <motion.div
      ref={commentRef}
      id={`comment-${comment.id}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: -10 }}
      className="p-4 transition-all duration-300 bg-transparent"
    >
      <div className="flex items-start space-x-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center space-y-1 pt-1">
          <Button
            key={`upvote-${comment.id}-${comment.userVote}`}
            size="sm"
            onClick={(e: any) => {
              e.stopPropagation()
              onCommentVote(comment.id, 'up')
            }}
            className={`h-6 w-6 p-0 ${comment.userVote === 'up' ? 'bg-green-500 text-white' : 'bg-transparent hover:bg-accent hover:text-foreground dark:hover:bg-accent/50 text-foreground'}`}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[1.5rem] text-center">
            {comment.score}
          </span>
          <Button
            key={`downvote-${comment.id}-${comment.userVote}`}
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onCommentVote(comment.id, 'down')
            }}
            className={`h-6 w-6 p-0 ${comment.userVote === 'down' ? 'bg-red-500 text-white' : 'bg-transparent hover:bg-accent hover:text-foreground dark:hover:bg-accent/50 text-foreground'}`}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Comment Body */}
        <div className="flex-1 flex items-start space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback className="bg-primary/10">
              {comment.author.avatar ? (
                comment.author.name.charAt(0).toUpperCase()
              ) : (
                <WorkCodileLogo className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <p className="font-medium text-sm">{comment.author.name}</p>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
            <MarkdownRenderer attachments={[]}>{comment.content}</MarkdownRenderer>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowReplyForm(!showReplyForm)
                }}
                className="h-6 px-2 text-xs"
              >
                Responder
              </Button>
              {comment.replies && comment.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (areRepliesVisible) {
                      setAreRepliesVisible(false);
                    } else {
                      handleLoadReplies();
                    }
                  }}
                  disabled={isLoadingReplies}
                  className="h-6 px-2 text-xs"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {isLoadingReplies
                    ? 'Cargando...'
                    : areRepliesVisible
                      ? 'Ocultar respuestas'
                      : `Ver ${comment.replies.length} respuestas`}
                </Button>
              )}
            </div>

            {showReplyForm && (
              <CreateCommentForm
                postId={postId}
                parentId={comment.id}
                onCommentSubmitted={() => {
                  console.log('Reply submitted');
                  setReplyContent(''); // Clear content after submission
                  setShowReplyForm(false); // Hide form after submission
                  handleLoadReplies(); // Reload replies to show the new one
                }}
              />
            )}

            {areRepliesVisible && replies.length > 0 && (
              <div className={`ml-0 pl-1 border-l-2 ${lineColor} mt-4`}>
                <CommentTree 
                  comments={replies} 
                  postId={postId} 
                  onCommentVote={onCommentVote} 
                  highlightCommentId={highlightCommentId} 
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
