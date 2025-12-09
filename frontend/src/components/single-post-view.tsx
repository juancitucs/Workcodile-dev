import { useParams, Link, useLocation } from 'react-router-dom';
import { useApp } from './app-context';
import { PostCard } from './post-card';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Post } from './types'; // Assuming types are defined in a separate file

export function SinglePostView() {
  const { posts, fetchPostById } = useApp();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      const existingPost = posts.find(p => p.id === id);
      if (existingPost) {
        setPost(existingPost);
      } else if (id) {
        const fetchedPost = await fetchPostById(id);
        setPost(fetchedPost);
      }
      setIsLoading(false);
    };
    loadPost();
  }, [id, posts, fetchPostById]);

  const highlightCommentId = location.hash.startsWith('#comment-') 
    ? location.hash.substring('#comment-'.length) 
    : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen workcodile-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cargando post...</h2>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen workcodile-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Post no encontrado</h2>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen workcodile-bg py-12">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al feed
            </Button>
          </Link>
        </div>
        <PostCard post={post} startWithCommentsOpen={true} highlightCommentId={highlightCommentId} />
      </div>
    </div>
  );
}
