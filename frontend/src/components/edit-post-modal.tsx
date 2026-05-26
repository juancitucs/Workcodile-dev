
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useApp } from './app-context';
import { Post } from './types';
import { Pencil, X, Hash, FileText, Paperclip, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { MentionsInput, Mention } from 'react-mentions';
import mentionsInputStyle from './mentions-input-style';
import MarkdownRenderer from './markdown-renderer';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { autoSpaceInsertion } from '../utils/text-utils';
import { formatFileSize, getFileIcon } from './file-utils';

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export function EditPostModal({ post, isOpen, onClose }: EditPostModalProps) {
  const { updatePost } = useApp();
  const mentionsInputRef = useRef<any>(null);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [hashtags, setHashtags] = useState<string[]>(post.hashtags || []);
  const [hashtagInput, setHashtagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setTitle(post.title);
    setContent(post.content);
    setHashtags(post.hashtags || []);
  }, [post]);

  const addHashtag = (tag: string) => {
    const cleanTag = tag.trim().replace(/^#/, '').toLowerCase();
    const truncatedTag = cleanTag.substring(0, 15);
    if (truncatedTag && !hashtags.includes(truncatedTag) && hashtags.length < 10) {
      setHashtags(prev => [...prev, truncatedTag]);
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleHashtagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (hashtagInput.trim()) {
        addHashtag(hashtagInput);
        setHashtagInput('');
      }
    }
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
    if (!isSubmitting) {
      setTitle(post.title);
      setContent(post.content);
      setHashtags(post.hashtags || []);
      setHashtagInput('');
      setShowPreview(false);
      onClose();
    }
  };

  // Create mentions data from attachments
  const attachmentMentions = post.attachments?.map(att => ({
    id: att.name,
    display: att.name,
  })) || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-7xl w-[95vw] h-full max-h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full max-h-[90vh]">
          {/* Left side - Form */}
          <div className="flex-1 flex flex-col border-r border-border">
            <div className="p-6 border-b border-border">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center space-x-2">
                    <Pencil className="h-5 w-5 text-primary" />
                    <span>Editar Publicación</span>
                  </DialogTitle>
                </div>
                <DialogDescription>
                  Modifica el contenido de tu publicación. Los cambios serán visibles inmediatamente.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                {/* Course Info - Read Only */}
                <div className="p-3 bg-muted/30 border border-border rounded-lg text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <span className="text-xs">📚 Curso:</span>
                    <span className="font-medium">{post.course}</span>
                    <span className="text-xs text-muted-foreground/60">(no editable)</span>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2 sidebar-item rounded-lg p-3 transition-all">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="edit-title">Título</Label>
                    <span className="text-xs text-muted-foreground">
                      {title.length}/150
                    </span>
                  </div>
                  <Input
                    id="edit-title"
                    placeholder="Título de la publicación"
                    value={title}
                    onChange={(e) => {
                      const processedValue = autoSpaceInsertion(e.target.value, 20);
                      setTitle(processedValue);
                    }}
                    required
                    maxLength={150}
                    className="text-base"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2 sidebar-item rounded-lg p-3 transition-all">
                  <Label htmlFor="edit-content">Contenido</Label>

                  {isMobile && showPreview ? (
                    <div className="min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" onClick={() => setShowPreview(false)}>
                      {content ? (
                        <MarkdownRenderer attachments={post.attachments}>{content}</MarkdownRenderer>
                      ) : (
                        <p className="text-muted-foreground">Escribe algo para ver la vista previa...</p>
                      )}
                    </div>
                  ) : (
                    <MentionsInput
                      inputRef={mentionsInputRef}
                      id="edit-content"
                      value={content}
                      onChange={(e) => {
                        let limitedValue = e.target.value.substring(0, 700);
                        limitedValue = limitedValue.replace(/\n{3,}/g, '\n\n');
                        const processedValue = autoSpaceInsertion(limitedValue, 20);
                        setContent(processedValue);
                      }}
                      placeholder="Contenido de la publicación (soporta Markdown). Menciona archivos con '@'."
                      style={mentionsInputStyle}
                      maxLength={700}
                      className="min-h-[200px] resize-y"
                    >
                      <Mention
                        trigger="@"
                        data={attachmentMentions}
                        markup={`@"__display__"`}
                        displayTransform={(id, display) => `@${display}`}
                      />
                    </MentionsInput>
                  )}

                  <div className="flex justify-end items-center text-xs text-muted-foreground">
                    {isMobile && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="mr-auto">
                        <Eye className="h-4 w-4 mr-1" />
                        {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
                      </Button>
                    )}
                    <span>{content.length}/700</span>
                  </div>
                </div>

                <Accordion type="multiple" className="w-full">
                  {/* Hashtags */}
                  <AccordionItem value="hashtags" className="sidebar-item rounded-lg transition-all">
                    <AccordionTrigger className="cursor-pointer">
                      <Label className="flex items-center space-x-2 cursor-pointer">
                        <Hash className="h-4 w-4 text-primary" />
                        <span>Hashtags ({hashtags.length}/10)</span>
                      </Label>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        <Input
                          placeholder="Añade hashtags relevantes (máximo 10)"
                          value={hashtagInput}
                          onChange={(e) => setHashtagInput(e.target.value)}
                          onKeyDown={handleHashtagKeyPress}
                          disabled={hashtags.length >= 10}
                        />
                        {hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {hashtags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs flex items-center space-x-1 bg-primary/10 text-primary border-primary/20 max-w-[150px]"
                              >
                                <Hash className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{tag}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 ml-1 text-primary hover:text-destructive"
                                  onClick={() => removeHashtag(tag)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Presiona Enter o Espacio para agregar
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Existing Attachments - Read Only */}
                  {post.attachments && post.attachments.length > 0 && (
                    <AccordionItem value="attachments" className="sidebar-item rounded-lg transition-all">
                      <AccordionTrigger className="cursor-pointer">
                        <Label className="flex items-center space-x-2 cursor-pointer">
                          <Paperclip className="h-4 w-4 text-primary" />
                          <span>Archivos adjuntos ({post.attachments.length})</span>
                          <span className="text-xs text-muted-foreground/60 ml-2">(no editable)</span>
                        </Label>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {post.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center space-x-3 p-3 bg-muted/30 border border-border rounded-lg"
                            >
                              <span className="text-lg">{getFileIcon(attachment.type)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate max-w-[200px]">{attachment.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground">
                            Los archivos adjuntos no pueden modificarse después de la publicación.
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </form>
            </div>

            {/* Actions - Fixed at bottom */}
            <div className="p-6 border-t border-border bg-background">
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!title.trim() || !content.trim() || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Pencil className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Preview */}
          {!isMobile && (
            <div className="w-1/2 flex flex-col bg-muted/20">
              <div className="p-6 border-b border-border">
                <h4 className="font-medium text-sm text-muted-foreground flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Vista previa en tiempo real</span>
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border border-border rounded-lg p-4 bg-card shadow-sm"
                  >
                    {/* Course Badge */}
                    <div className="flex items-center space-x-2 text-xs text-primary mb-3 p-2 bg-primary/10 rounded-md">
                      <span>📚</span>
                      <span className="font-medium text-primary">{post.course}</span>
                    </div>

                    {/* Title */}
                    {title ? (
                      <h3 className="font-semibold text-lg mb-3 leading-tight break-words">{title}</h3>
                    ) : (
                      <div className="h-6 bg-muted/50 rounded mb-3 animate-pulse"></div>
                    )}

                    {/* Content */}
                    <div className="prose prose-sm dark:prose-invert max-w-none mb-4 text-sm break-words">
                      <MarkdownRenderer attachments={post.attachments}>{content || ""}</MarkdownRenderer>
                    </div>

                    {/* Hashtags */}
                    {hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {hashtags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary border-primary/20 max-w-[120px]"
                          >
                            <span className="truncate">#{tag}</span>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Attachments Preview */}
                    {post.attachments && post.attachments.length > 0 && (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="attachments-preview">
                          <AccordionTrigger className="cursor-pointer">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Paperclip className="h-4 w-4" />
                              <span>{post.attachments.length} archivo{post.attachments.length > 1 ? 's' : ''} adjunto{post.attachments.length > 1 ? 's' : ''}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pt-2">
                              {post.attachments.map((attachment) => (
                                <motion.div
                                  key={attachment.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center space-x-2 text-xs bg-muted/50 rounded p-2 border border-border"
                                >
                                  <span className="text-sm">{getFileIcon(attachment.type)}</span>
                                  <div className="flex-1 min-w-0">
                                    <span className="truncate block font-medium">{attachment.name}</span>
                                    <span className="text-muted-foreground">({formatFileSize(attachment.size)})</span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}

                    {/* Post meta */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1"><span>⬆️</span><span>{post.upvotes - post.downvotes}</span></div>
                        <div className="flex items-center space-x-1"><span>💬</span><span>{post.comments?.length || 0}</span></div>
                      </div>
                      <span className="text-xs text-muted-foreground italic">(editado)</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
