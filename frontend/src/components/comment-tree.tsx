import { memo } from 'react';
import { Comment } from './comment';

interface CommentTreeProps {
  comments: any[];
  postId: string;
  onCommentVote: (commentId: string, vote: 'up' | 'down') => void;
  highlightCommentId?: string;
  depth?: number;
}

const CommentTreeComponent = ({ comments, postId, onCommentVote, highlightCommentId, depth = 0 }: CommentTreeProps) => {
  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <div key={`${comment.id}-${comment.userVote}`}>
          <Comment comment={comment} postId={postId} onCommentVote={onCommentVote} highlightCommentId={highlightCommentId} depth={depth} />
        </div>
      ))}
    </div>
  );
};

// React.memo to prevent re-renders when comments haven't changed
export const CommentTree = memo(CommentTreeComponent, (prevProps, nextProps) => {
  return (
    prevProps.postId === nextProps.postId &&
    prevProps.comments.length === nextProps.comments.length &&
    prevProps.highlightCommentId === nextProps.highlightCommentId &&
    prevProps.depth === nextProps.depth &&
    // Deep check on first comment to detect vote changes
    prevProps.comments[0]?.userVote === nextProps.comments[0]?.userVote
  );
});
