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

interface CommentProps {
  comment: CommentType
  postId: string
  onCommentVote: (commentId: string, vote: 'up' | 'down') => void
  highlightCommentId?: string;
}

export function Comment({ comment, postId, onCommentVote, highlightCommentId }: CommentProps) {
  const { user, addComment, fetchCommentReplies } = useApp()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replies, setReplies] = useState<any[]>([])
  const [areRepliesVisible, setAreRepliesVisible] = useState(false)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const commentRef = useRef<HTMLDivElement>(null);

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
    if (commentRef.current && comment.id === highlightCommentId) {
      commentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      commentRef.current.classList.add('comment-highlight');
      setTimeout(() => {
        commentRef.current?.classList.remove('comment-highlight');
      }, 2000); // Duration of the animation
    }
  }, [comment.id, highlightCommentId]);

  useEffect(() => {
    if (highlightCommentId && comment.replies && comment.replies.length > 0) {
      if (isCommentInSubtree(comment.replies, highlightCommentId)) {
        if (!areRepliesVisible) {
          handleLoadReplies();
        }
      }
    }
  }, [highlightCommentId, comment.replies, areRepliesVisible]);


  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    await addComment(postId, replyContent, comment.id)
    setReplyContent('')
    setShowReplyForm(false)
    // After submitting a reply, always refetch to show the new one and expand the view
    handleLoadReplies();
  }

  const handleLoadReplies = async () => {
    if (isLoadingReplies) return;
    setIsLoadingReplies(true);
    const fetchedReplies = await fetchCommentReplies(postId, comment.id);
    setReplies(fetchedReplies);
    setAreRepliesVisible(true);
    setIsLoadingReplies(false);
  }

  return (
    <motion.div
      ref={commentRef}
      id={`comment-${comment.id}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: -10 }}
      className="glass-card p-4 shadow-modern hover:shadow-modern-lg transition-all duration-300"
    >
      <div className="flex items-start space-x-2">
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
          <p className="text-sm mb-2 whitespace-pre-wrap">{comment.content}</p>

          <div className="flex items-center space-x-1">
            <Button
              variant={comment.userVote === 'up' ? 'default' : 'ghost'}
              size="sm"
              onClick={(e: any) => {
                e.stopPropagation()
                onCommentVote(comment.id, 'up')
              }}
              className="h-6 px-2 text-xs"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium min-w-[1.5rem] text-center">
              {comment.score}
            </span>
            <Button
              variant={comment.userVote === 'down' ? 'destructive' : 'ghost'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onCommentVote(comment.id, 'down')
              }}
              className="h-6 px-2 text-xs"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowReplyForm(!showReplyForm)
              }}
              className="h-6 px-2 text-xs ml-2"
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
                className="h-6 px-2 text-xs ml-2"
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
            <form onSubmit={handleReplySubmit} className="mt-4 space-y-2">
              <Textarea
                placeholder={`Responder a ${comment.author.name}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] resize-none"
                onClick={(e) => e.stopPropagation()}
              />{' '}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Enviar respuesta
                </Button>
              </div>
            </form>
          )}

          {areRepliesVisible && replies.length > 0 && (
            <div className="ml-4 pl-2 border-l-2 border-blue-500/50 dark:border-blue-400/50 mt-4">
              <CommentTree 
                comments={replies} 
                postId={postId} 
                onCommentVote={onCommentVote} 
                highlightCommentId={highlightCommentId} 
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
