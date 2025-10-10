import { Comment } from './comment';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';

interface CommentTreeProps {
  comments: any[];
  postId: string;
  onCommentVote: (commentId: string, vote: 'up' | 'down') => void;
}

export function CommentTree({ comments, postId, onCommentVote }: CommentTreeProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id}>
          <Comment comment={comment} postId={postId} onCommentVote={onCommentVote} />
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
              <Collapsible className="mt-4" defaultOpen={true}>
                <CollapsibleTrigger asChild>
                  <Button variant="link" size="sm" className="h-6 px-2 text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {comment.replies.length} respuestas
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <CommentTree comments={comment.replies} postId={postId} onCommentVote={onCommentVote} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}