import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Post, Comment, FileAttachment } from './types'; // Assuming types are defined here
import { useAuth } from './auth-context'; // Import useAuth to get the token and user ID

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper functions (moved from app-context.tsx)
const transformBackendComment = (comment: any): Comment => {
  return {
    ...comment,
    id: comment._id,
    createdAt: new Date(comment.createdAt),
    author: {
      id: comment.author?._id?.toString() || '',
      name: comment.author?.name || 'Usuario Anónimo',
      avatar: comment.author?.avatar_key ? comment.author.avatar : undefined,
      university: 'UNAM',
      email: comment.author?.email || '',
    },
    score: comment.score,
    userVote: comment.user_vote,
    replies: comment.replies ? comment.replies.map(transformBackendComment) : [],
  };
};

const transformBackendPost = (post: any): Post => ({
  id: post._id,
  title: post.title,
  content: post.content,
  author: {
    id: post.author?._id?.toString() || '',
    name: post.author?.name || 'Usuario Anónimo',
    avatar: post.author?.avatar_key ? post.author.avatar : undefined,
    university: 'UNAM',
    email: post.author?.email || '',
  },
  createdAt: new Date(post.createdAt),
  course: post.course_id || '',
  upvotes: post.upvote_count || 0,
  downvotes: post.downvote_count || 0,
  comments: post.comments ? post.comments.map(transformBackendComment) : [],
  hashtags: post.hashtags || [],
  attachments: post.attachments ? post.attachments.map((att: any) => ({
    ...att,
  })) : [],
  views: post.views || 0,
  isBookmarked: false,
  userVote: post.user_vote,
});

// Helper function to find and optimistically update a comment in a nested structure
const findAndUpdateCommentRecursive = (
  comments: Comment[],
  targetCommentId: string,
  vote: 'up' | 'down',
  userId: string // Not directly used for userVote anymore, but can be for score if needed
): Comment[] => {
  return comments.map(comment => {
    if (comment.id === targetCommentId) {
      let newScore = comment.score;
      let newUserVote = comment.userVote;

      if (vote === 'up') {
        if (comment.userVote === 'up') { // Un-upvoting
          newScore--;
          newUserVote = null;
        } else { // Upvoting
          newScore++;
          newUserVote = 'up';
          if (comment.userVote === 'down') { // Was downvoting, undo previous downvote from score
            newScore++;
          }
        }
      } else { // vote === 'down'
        if (comment.userVote === 'down') { // Un-downvoting
          newScore++;
          newUserVote = null;
        } else { // Downvoting
          newScore--;
          newUserVote = 'down';
          if (comment.userVote === 'up') { // Was upvoting, undo previous upvote from score
            newScore--;
          }
        }
      }

      return {
        ...comment,
        score: newScore,
        userVote: newUserVote,
      };
    } else if (comment.replies && comment.replies.length > 0) {
      // Recursively check replies
      return {
        ...comment,
        replies: findAndUpdateCommentRecursive(comment.replies, targetCommentId, vote, userId),
      };
    }
    return comment; // No change to this comment or its replies
  });
};

interface PostsContextType {
  posts: Post[];
  fetchPostById: (postId: string) => Promise<Post | undefined>;
  createPost: (
    title: string,
    content: string,
    course: string,
    hashtags: string[],
    attachments: FileAttachment[]
  ) => Promise<void>;
  votePost: (postId: string, vote: 'up' | 'down') => Promise<void>;
  addComment: (
    postId: string,
    content: string,
    parentId?: string
  ) => Promise<void>;
  voteComment: (
    postId: string,
    commentId: string,
    vote: 'up' | 'down'
  ) => Promise<void>;
  fetchCommentReplies: (postId: string, commentId: string) => Promise<Comment[]>;
  searchPosts: (query: string) => Post[]; // This will need to search the current `posts` state
  toggleBookmark: (postId: string) => void;
  reportPost: (postId: string) => void;
  incrementViews: (postId: string) => void;
  incrementViewsBatch: (postIds: string[]) => void;
  mainFeedKey: number;
  resetMainFeed: () => void;
  fetchMorePosts: () => void;
  hasMorePosts: boolean;
  isFetchingPosts: boolean;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const { authStatus, user } = useAuth(); // Get authStatus and user from AuthContext
  const [posts, setPosts] = useState<Post[]>([]);
  const [mainFeedKey, setMainFeedKey] = useState(0);
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);

  // Fetch initial posts when authStatus changes to authenticated
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchInitialPosts();
    }
  }, [authStatus]); // Dependency on authStatus

  const fetchInitialPosts = async () => {
    setIsFetchingPosts(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts?page=1`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const transformedPosts: Post[] = data.posts.map(transformBackendPost);
      setPosts(transformedPosts);
      setPostPage(1);
      setHasMorePosts(data.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsFetchingPosts(false);
    }
  };

  const fetchMorePosts = async () => {
    if (isFetchingPosts || !hasMorePosts) return;

    setIsFetchingPosts(true);
    const nextPage = postPage + 1;
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts?page=${nextPage}`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const transformedPosts: Post[] = data.posts.map(transformBackendPost);
      setPosts(prevPosts => [...prevPosts, ...transformedPosts]);
      setPostPage(nextPage);
      setHasMorePosts(data.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch more posts:', error);
    } finally {
      setIsFetchingPosts(false);
    }
  };

  const fetchPostById = async (postId: string): Promise<Post | undefined> => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const transformedPost = transformBackendPost(data);

      setPosts(prevPosts => {
        const postExists = prevPosts.some(p => p.id === transformedPost.id);
        if (postExists) {
          return prevPosts.map(p => p.id === transformedPost.id ? transformedPost : p);
        }
        return [...prevPosts, transformedPost];
      });

      return transformedPost;
    } catch (error) {
      console.error('Failed to fetch post by ID:', error);
      return undefined;
    }
  };

  const resetMainFeed = () => {
    setMainFeedKey((prev) => prev + 1);
    fetchInitialPosts();
  };

  const createPost = async (
    title: string,
    content: string,
    course: string,
    hashtags: string[],
    attachments: FileAttachment[]
  ) => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ title, content, course, hashtags, attachments }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = await response.json();
      const transformedPost = transformBackendPost(newPost);
      setPosts((prev) => [transformedPost, ...prev]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const votePost = async (postId: string, vote: 'up' | 'down') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let originalPosts: Post[] = [];

    try {
      setPosts((prev) => {
        originalPosts = prev;
        const postIndex = prev.findIndex(p => p.id === postId);
        if (postIndex === -1) return prev;

        const originalPost = prev[postIndex];
        let newUpvotes = originalPost.upvotes;
        let newDownvotes = originalPost.downvotes;
        let newUserVote = originalPost.userVote;

        if (vote === 'up') {
          if (originalPost.userVote === 'up') {
            newUpvotes--;
            newUserVote = null;
          } else {
            newUpvotes++;
            if (originalPost.userVote === 'down') {
              newDownvotes--;
            }
            newUserVote = 'up';
          }
        } else {
          if (originalPost.userVote === 'down') {
            newDownvotes--;
            newUserVote = null;
          } else {
            newDownvotes++;
            if (originalPost.userVote === 'up') {
              newUpvotes--;
            }
            newUserVote = 'down';
          }
        }

        const optimisticPost = {
          ...originalPost,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newUserVote,
        };

        const newPosts = [...prev];
        newPosts[postIndex] = optimisticPost;
        return newPosts;
      });

      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ vote }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to vote on post');
      }

      const updatedPostFromServer = await response.json();
      const transformedPostFromServer = transformBackendPost(updatedPostFromServer);

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? transformedPostFromServer : p))
      );
    } catch (error) {
      console.error('Error voting on post:', error);
      setPosts(originalPosts);
    }
  };

  const addComment = async (
    postId: string,
    content: string,
    parentId?: string
  ) => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ content, parentId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const updatedPost = await response.json();
      const transformedPost = transformBackendPost(updatedPost);

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? transformedPost : p))
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const voteComment = async (
    postId: string,
    commentId: string,
    vote: 'up' | 'down'
  ) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!user) return;

    let originalPosts: Post[] = [];

    try {
      setPosts((prevPosts) => {
        originalPosts = prevPosts;
        const postIndex = prevPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) return prevPosts;

        const postToUpdate = { ...prevPosts[postIndex] };

        const updatedComments = findAndUpdateCommentRecursive(
          postToUpdate.comments,
          commentId,
          vote,
          user.id
        );

        const optimisticPost = {
          ...postToUpdate,
          comments: updatedComments,
        };

        const newPosts = [...prevPosts];
        newPosts[postIndex] = optimisticPost;
        return newPosts;
      });

      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/comments/${commentId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ vote }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to vote on comment');
      }

      const updatedPostFromServer = await response.json();
      const transformedPostFromServer = transformBackendPost(updatedPostFromServer);

      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === postId ? transformedPostFromServer : p))
      );
    } catch (error) {
      console.error('Error voting on comment:', error);
      setPosts(originalPosts);
    }
  };

  const fetchCommentReplies = async (postId: string, commentId: string): Promise<Comment[]> => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments/${commentId}/replies`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map(transformBackendComment);
    } catch (error) {
      console.error('Failed to fetch replies:', error);
      return [];
    }
  };

  const searchPosts = (query: string) => {
    if (!query.trim()) return posts;

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.author.name.toLowerCase().includes(query.toLowerCase()) ||
        post.hashtags.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
    );
  };

  const toggleBookmark = async (postId: string) => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to bookmark post');
      }

      const { bookmarked } = await response.json();

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              isBookmarked: bookmarked,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const reportPost = async (postId: string, reason: string = 'No reason provided') => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to report post');
      }

      console.log(`Post ${postId} reported by user ${user?.id}`);
    } catch (error) {
      console.error('Error reporting post:', error);
    }
  };

  const incrementViews = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            views: post.views + 1,
          };
        }
        return post;
      })
    );
  };

  const incrementViewsBatch = async (postIds: string[]) => {
    if (postIds.length === 0) return;
    try {
      await fetch(`${API_BASE_URL}/api/posts/views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postIds }),
      });

      setPosts((prevPosts) =>
        prevPosts.map(post => {
          if (postIds.includes(post.id)) {
            // This could lead to double increments if not handled carefully.
            // For this reason, incrementViews is kept as a local-only update for now.
            // And the batch is for the backend.
            // A more robust implementation might be needed.
            // For now, we assume the backend handles avoiding double counts.
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error incrementing views in batch:', error);
    }
  };


  return (
    <PostsContext.Provider
      value={{
        posts,
        fetchPostById,
        createPost,
        votePost,
        addComment,
        voteComment,
        fetchCommentReplies,
        searchPosts,
        toggleBookmark,
        reportPost,
        incrementViews,
        incrementViewsBatch,
        mainFeedKey,
        resetMainFeed,
        fetchMorePosts,
        hasMorePosts,
        isFetchingPosts,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}
