import { useApp } from './app-context';
import { PostCard } from './post-card';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

export function SinglePostView() {
  const { posts, selectedPostId, selectPost } = useApp();

  const post = posts.find(p => p.id === selectedPostId);

  if (!post) {
    return (
      <div className="min-h-screen workcodile-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Post no encontrado</h2>
          <Button onClick={() => selectPost(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen workcodile-bg py-12">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-8">
          <Button onClick={() => selectPost(null)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al feed
          </Button>
        </div>
        <PostCard post={post} />
      </div>
    </div>
  );
}
