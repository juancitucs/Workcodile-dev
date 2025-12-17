import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from './ui/dialog'
import { toast } from 'sonner'
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
  ExternalLink,
} from 'lucide-react'

interface PostActionsProps {
  postId: string
  postTitle: string
  commentsCount: number
  viewsCount?: number
  isBookmarked?: boolean
  onToggleComments: () => void
  onNavigate?: () => void
  onBookmark?: () => void
  onReport?: () => void
}

export function PostActions({
  postId,
  postTitle,
  commentsCount,
  viewsCount = 0,
  isBookmarked = false,
  onToggleComments,
  onNavigate,
  onBookmark,
  onReport,
}: PostActionsProps) {
  const [showShareDialog, setShowShareDialog] = useState(false)

  const postUrl = `${window.location.origin}/post/${postId}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      toast.success('Enlace copiado al portapapeles')
      setShowShareDialog(false)
    } catch (error) {
      toast.error('Error al copiar el enlace')
    }
  }

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
    setShowShareDialog(false)
  }

  const handleShareTwitter = () => {
    const text = `${postTitle} - WorkCodile UNAM`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
    setShowShareDialog(false)
  }

  const handleShareWhatsApp = () => {
    const text = `${postTitle} - WorkCodile UNAM: ${postUrl}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    setShowShareDialog(false)
  }

  const handleBookmark = () => {
    onBookmark?.()
    toast.success(
      isBookmarked
        ? 'Publicación eliminada de guardados'
        : 'Publicación guardada'
    )
  }

  const handleReport = () => {
    onReport?.()
    toast.success('Publicación reportada. Será revisada por los moderadores.')
  }

  const formatViews = (views: number) => {
    if (views < 1000) return views.toString()
    if (views < 1000000) return `${(views / 1000).toFixed(1)}k`
    return `${(views / 1000000).toFixed(1)}M`
  }

  return (
    <div className="flex items-center justify-between">
      {/* Left actions */}
      <div className="flex items-center space-x-4">
        {/* Comments */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (onNavigate) {
              onNavigate()
            } else {
              onToggleComments()
            }
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {commentsCount} comentario{commentsCount !== 1 ? 's' : ''}
          </span>
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
                  <span className="flex-1 truncate text-muted-foreground">
                    {postUrl}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Views count */}
        {viewsCount > 0 && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span className="hidden sm:inline">
              {formatViews(viewsCount)} visualizaciones
            </span>
            <span className="sm:hidden">{formatViews(viewsCount)}</span>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center space-x-2">

      </div>    </div>
  )
}
