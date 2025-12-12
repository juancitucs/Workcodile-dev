import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useApp } from './app-context';
import { WorkCodileLogo } from './crocodile-icon';
import { ChevronUp, ChevronDown, MessageSquare, Paperclip, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CommentTree } from './comment-tree';
import { Comment as CommentType, FileAttachment } from './types'; // Add FileAttachment
import MarkdownRenderer from './markdown-renderer';
import { CreateCommentForm } from './CreateCommentForm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'; // Add Accordion
import { formatFileSize, getFileIcon, getAttachmentUrl } from './file-utils'; // Add file utils

interface CommentProps {
  comment: CommentType;
  postId: string;
  onCommentVote: (commentId: string, vote: 'up' | 'down') => void;
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
  const { user, fetchCommentReplies } = useApp();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState<CommentType[]>(comment.replies || []);
  const [areRepliesVisible, setAreRepliesVisible] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (comment.replies) {
      setReplies(comment.replies);
    }
  }, [comment.replies]);

  const handleDownload = (e: React.MouseEvent, attachment: FileAttachment) => {
    e.stopPropagation();
    const downloadUrl = getAttachmentUrl(attachment);
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      console.error('Could not get download URL for attachment:', attachment);
    }
  };

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
  };

  const lineColor = lineColors[depth % lineColors.length];

  return (
    <motion.div
      ref={commentRef}
      id={`comment-${comment.id}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative pl-4"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700`}></div>
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8 z-10 mt-1">
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

          <div className="prose prose-sm dark:prose-invert max-w-none mb-2">
            <MarkdownRenderer attachments={comment.attachments || []}>{comment.content}</MarkdownRenderer>
          </div>

          {comment.attachments && comment.attachments.length > 0 && (
            <Accordion type="single" collapsible className="w-full mb-3">
              <AccordionItem value="attachments">
                <AccordionTrigger className="text-xs py-1">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Paperclip className="h-3 w-3" />
                    <span>
                      {comment.attachments.length} archivo{comment.attachments.length > 1 ? 's' : ''} adjunto{comment.attachments.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {comment.attachments.map((attachment, index) => (
                      <div key={`${index}-${attachment.name}`} onClick={(e) => handleDownload(e, attachment)}>
                        <motion.div
                          whileHover={{ scale: 1.02, y: -1 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="flex items-center space-x-2 p-2 bg-background-alt rounded-md hover:bg-accent cursor-pointer transition-colors shadow-sm"
                        >
                          <span className="text-sm">{getFileIcon(attachment.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
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

          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onCommentVote(comment.id, 'up')}
                className={`h-6 w-6 ${comment.userVote === 'up' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[1rem] text-center">{comment.score}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onCommentVote(comment.id, 'down')}
                className={`h-6 w-6 ${comment.userVote === 'down' ? 'text-destructive' : 'text-muted-foreground'}`}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="h-6 px-2 text-xs"
            >
              Responder
            </Button>
            {comment.replies && comment.replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (areRepliesVisible ? setAreRepliesVisible(false) : handleLoadReplies())}
                disabled={isLoadingReplies}
                className="h-6 px-2 text-xs"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                {isLoadingReplies
                  ? 'Cargando...'
                  : areRepliesVisible
                    ? 'Ocultar'
                    : `Ver ${comment.replies.length} ${comment.replies.length > 1 ? 'respuestas' : 'respuesta'}`}
              </Button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3">
              <CreateCommentForm
                postId={postId}
                parentId={comment.id}
                onCommentSubmitted={() => {
                  setShowReplyForm(false);
                  handleLoadReplies();
                }}
              />
            </div>
          )}

          {areRepliesVisible && replies.length > 0 && (
            <div className={`pl-4 border-l-2 ${lineColor} mt-3`}>
              <CommentTree comments={replies} postId={postId} onCommentVote={onCommentVote} highlightCommentId={highlightCommentId} depth={depth + 1} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}