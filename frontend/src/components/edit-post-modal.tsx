
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useApp } from './app-context';
import { Post } from './types';
import { X, Plus, Hash, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export function EditPostModal({ post, isOpen, onClose }: EditPostModalProps) {
  const { updatePost } = useApp();
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [hashtags, setHashtags] = useState<string[]>(post.hashtags || []);
  const [newHashtag, setNewHashtag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(post.title);
    setContent(post.content);
    setHashtags(post.hashtags || []);
  }, [post]);

  const addHashtag = () => {
    const tag = newHashtag.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag) && hashtags.length < 5) {
      setHashtags([...hashtags, tag]);
      setNewHashtag('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('El título no puede estar vacío');
      return;
    }
    if (!content.trim()) {
      toast.error('El contenido no puede estar vacío');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePost(post.id, { title, content, hashtags });
      toast.success('Publicación actualizada');
      onClose();
    } catch (error) {
      toast.error('Error al actualizar la publicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset to original values
    setTitle(post.title);
    setContent(post.content);
    setHashtags(post.hashtags || []);
    setNewHashtag('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Editar Publicación
          </DialogTitle>
          <DialogDescription>
            Modifica el contenido de tu publicación. Los cambios serán visibles inmediatamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Título */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="edit-title">Título</Label>
              <span className="text-xs text-muted-foreground">{title.length}/100</span>
            </div>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la publicación"
              maxLength={100}
            />
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="edit-content">Contenido</Label>
              <span className="text-xs text-muted-foreground">{content.length}/5000</span>
            </div>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Contenido de la publicación (soporta Markdown)"
              rows={8}
              maxLength={5000}
              className="resize-none"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label>Hashtags ({hashtags.length}/5)</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addHashtag();
                    }
                  }}
                  placeholder="Agregar hashtag..."
                  className="pl-9"
                  maxLength={20}
                  disabled={hashtags.length >= 5}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHashtag}
                disabled={hashtags.length >= 5 || !newHashtag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-primary/10 text-primary px-3 py-1 text-sm flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Nota informativa */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            💡 <strong>Nota:</strong> El curso asignado y los archivos adjuntos no pueden modificarse después de la publicación.
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
