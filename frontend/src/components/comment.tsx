import { useState } from 'react';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useApp } from './app-context';
import { WorkCodileLogo } from './crocodile-icon';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CommentProps {
  comment: any;
  postId: string;
  onCommentVote: (commentId: string, vote: 'up' | 'down') => void;
}

export function Comment({ comment, postId, onCommentVote }: CommentProps) {
  const { user, addComment } = useApp();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    addComment(postId, replyContent, comment.id);
    setReplyContent('');
    setShowReplyForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-4 shadow-modern hover:shadow-modern-lg transition-all duration-300"
    >
      <div className="flex items-start space-x-3">
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
              {formatDistanceToNow(comment.createdAt, {
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
              onClick={() => onCommentVote(comment.id, 'up')}
              className="h-6 px-2 text-xs"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium min-w-[1.5rem] text-center">{comment.score}</span>
            <Button
              variant={comment.userVote === 'down' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onCommentVote(comment.id, 'down')}
              className="h-6 px-2 text-xs"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="h-6 px-2 text-xs ml-2"
            >
              Responder
            </Button>
          </div>

          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-4 space-y-2">
              <Textarea
                placeholder={`Responder a ${comment.author.name}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  Enviar respuesta
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}