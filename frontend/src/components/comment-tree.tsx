import { Comment } from './comment';

interface CommentTreeProps {
  comments: any[];
  postId: string;
  onCommentVote: (commentId: string, vote: 'up' | 'down') => void;
  highlightCommentId?: string;
}

export function CommentTree({ comments, postId, onCommentVote, highlightCommentId }: CommentTreeProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id}>
          <Comment comment={comment} postId={postId} onCommentVote={onCommentVote} highlightCommentId={highlightCommentId} />
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 pl-8 border-l-2 border-blue-500 dark:border-blue-400">
              <div className="mt-2">
                <CommentTree comments={comment.replies} postId={postId} onCommentVote={onCommentVote} highlightCommentId={highlightCommentId} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}