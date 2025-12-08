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
        </div>
      ))}
    </div>
  );
}
