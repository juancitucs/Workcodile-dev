import { Comment } from './comment';

interface CommentTreeProps {
  comments: any[];
  postId: string;
  onCommentVote: (commentId: string, vote: 'up' | 'down') => void;
  highlightCommentId?: string;
  depth?: number;
}

export function CommentTree({ comments, postId, onCommentVote, highlightCommentId, depth = 0 }: CommentTreeProps) {
  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <div key={`${comment.id}-${comment.userVote}`}>
          <Comment comment={comment} postId={postId} onCommentVote={onCommentVote} highlightCommentId={highlightCommentId} depth={depth} />
        </div>
      ))}
    </div>
  );
}
