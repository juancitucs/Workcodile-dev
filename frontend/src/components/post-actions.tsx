import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';
import { 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  Flag, 
  Copy, 
  Facebook, 
  Twitter,
  MessageCircle,
  Eye,
  Calendar,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import { CrocodileRating } from './crocodile-rating';
import { CrocodileEmoji, WorkCodileLogo } from './crocodile-icon';

interface PostActionsProps {
  postId: string;
  postTitle: string;
  commentsCount: number;
  viewsCount?: number;
  isBookmarked?: boolean;
  rating: number;
  totalRatings: number;
  userRating?: number;
  onToggleComments: () => void;
  onBookmark?: () => void;
  onRate?: (rating: number) => void;
  onReport?: () => void;
}

export function PostActions({
  postId,
  postTitle,
  commentsCount,
  viewsCount = 0,
  isBookmarked = false,
  rating,
  totalRatings,
  userRating,
  onToggleComments,
  onBookmark,
  onRate,
  onReport
}: PostActionsProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  const postUrl = `${window.location.origin}/post/${postId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success('Enlace copiado al portapapeles');
      setShowShareDialog(false);
    } catch (error) {
      toast.error('Error al copiar el enlace');
    }
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareDialog(false);
  };

  const handleShareTwitter = () => {
    const text = `${postTitle} - WorkCodile UNAM`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareDialog(false);
  };

  const handleShareWhatsApp = () => {
    const text = `${postTitle} - WorkCodile UNAM: ${postUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShowShareDialog(false);
  };

  const handleBookmark = () => {
    onBookmark?.();
    toast.success(isBookmarked ? 'Publicación eliminada de guardados' : 'Publicación guardada');
  };

  const handleReport = () => {
    onReport?.();
    toast.success('Publicación reportada. Será revisada por los moderadores.');
  };

  const formatViews = (views: number) => {
    if (views < 1000) return views.toString();
    if (views < 1000000) return `${(views / 1000).toFixed(1)}k`;
    return `${(views / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="flex items-center justify-between">
      {/* Left actions */}
      <div className="flex items-center space-x-4">
        {/* Comments */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleComments}
          className="text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{commentsCount} comentario{commentsCount !== 1 ? 's' : ''}</span>
          <span className="sm:hidden">{commentsCount}</span>
        </Button>

        {/* Share */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Share2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Compartir</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Compartir publicación</DialogTitle>
              <DialogDescription>
                Comparte esta publicación con otros estudiantes de la UNAM
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copiar enlace</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareWhatsApp}
                  className="flex items-center space-x-2 text-green-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareFacebook}
                  className="flex items-center space-x-2 text-blue-600"
                >
                  <Facebook className="h-4 w-4" />
                  <span>Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareTwitter}
                  className="flex items-center space-x-2 text-blue-400"
                >
                  <Twitter className="h-4 w-4" />
                  <span>Twitter</span>
                </Button>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center space-x-2 p-2 bg-muted rounded text-sm">
                  <ExternalLink className="h-4 w-4" />
                  <span className="flex-1 truncate text-muted-foreground">{postUrl}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Views count */}
        {viewsCount > 0 && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span className="hidden sm:inline">{formatViews(viewsCount)} visualizaciones</span>
            <span className="sm:hidden">{formatViews(viewsCount)}</span>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center space-x-2">
        {/* Rating */}
        <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`transition-all hover:bg-workcodile-green/10 hover:text-workcodile-green border border-transparent hover:border-workcodile-green/20 ${
                userRating ? 'bg-workcodile-green/10 text-workcodile-green border-workcodile-green/20' : 'text-muted-foreground'
              }`}
            >
              <div className="flex items-center space-x-2">
                <WorkCodileLogo className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                  <span className="text-xs leading-none">
                    {userRating ? `Tu voto: ${userRating}` : 'Calificar'}
                  </span>
                </div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                <div className="flex items-center justify-center space-x-2">
                  <WorkCodileLogo className="w-6 h-6" />
                  <span>Calificar publicación</span>
                </div>
              </DialogTitle>
              <DialogDescription className="text-center">
                Califica qué tan útil te pareció esta publicación usando nuestro sistema de cocodrilos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="text-center">
                <p className="text-base text-muted-foreground mb-6">
                  ¿Qué tan útil te pareció esta publicación?
                </p>
                <CrocodileRating
                  rating={rating}
                  userRating={userRating || 0}
                  totalRatings={totalRatings}
                  onRate={(newRating) => {
                    onRate?.(newRating);
                    setShowRatingDialog(false);
                    toast.success(`¡Calificación enviada! ${newRating} cocodrilo${newRating !== 1 ? 's' : ''}`);
                  }}
                  size="lg"
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p>Ayuda a otros estudiantes calificando el contenido</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* More options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleBookmark}>
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="h-4 w-4 mr-2" />
                  Eliminar de guardados
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Guardar publicación
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartir...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleReport} className="text-destructive">
              <Flag className="h-4 w-4 mr-2" />
              Reportar publicación
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}