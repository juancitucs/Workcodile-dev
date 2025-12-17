import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useApp } from './app-context';
import { FileAttachment, createFileAttachment, formatFileSize, getFileIcon, validateFileType, validateFileSize } from './file-utils';
import { PlusCircle, X, GraduationCap, Upload, FileText, Hash, Trash2, Eye, Paperclip } from 'lucide-react';
import MarkdownRenderer from './markdown-renderer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { MentionsInput, Mention } from 'react-mentions';
import mentionsInputStyle from './mentions-input-style';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { autoSpaceInsertion } from '../utils/text-utils';


interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sanitizeFilename = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  const filenameBody = lastDot === -1 ? filename : filename.substring(0, lastDot);
  const extension = lastDot === -1 ? '' : filename.substring(lastDot);

  // Replace all invalid characters with a single underscore
  let sanitized = filenameBody.replace(/[^a-zA-Z0-9_-]+/g, '_');

  // Remove leading and trailing underscores
  sanitized = sanitized.replace(/^_+|_+$/g, '');

  // If the name is empty after sanitization (e.g., "!!.txt"), use a default name
  if (!sanitized) {
    sanitized = 'file';
  }

  return sanitized + extension;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const uploadFiles = async (files: File[]): Promise<(Omit<FileAttachment, 'id'> & { object_key: string })[]> => {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    const sanitizedFilename = sanitizeFilename(file.name);
    console.log(`Uploading file: ${file.name} as ${sanitizedFilename}`);
    formData.append('file', file, sanitizedFilename);

    try {
      const response = await fetch(`${API_BASE_URL}/api/storage`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token') || '',
        },
        body: formData,
      });

      console.log('Upload response:', response);

      if (!response.ok) {
        throw new Error(`Error uploading file: ${file.name}`);
      }

      const result = await response.json();
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        object_key: result.objectName,
      };
    } catch (error) {
      console.error(error);
      // You might want to handle this more gracefully
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);
  return results.filter((result): result is (Omit<FileAttachment, 'id'> & { object_key: string }) => result !== null);
};

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { createPost, courses, getCoursesByCycle } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mentionsInputRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    cycle: '',
    course: ''
  });
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const cycles = Array.from({ length: 10 }, (_, i) => i + 1);
  const availableCourses = formData.cycle ? getCoursesByCycle(parseInt(formData.cycle)) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.course) {
      return;
    }

    setIsSubmitting(true);

    try {
      const filesToUpload = attachments.map(a => a.file).filter(f => f) as File[];
      const uploadedAttachmentsData = await uploadFiles(filesToUpload);
      const newAttachments: (Omit<FileAttachment, 'id'> & { object_key: string; })[] = uploadedAttachmentsData.map((uploadedFile) => ({
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        object_key: uploadedFile.object_key,
      }));

      await createPost(formData.title, formData.content, formData.course, hashtags, newAttachments.map(a => ({ ...a, id: crypto.randomUUID() })));

      // Reset form
      setFormData({
        title: '',
        content: '',
        cycle: '',
        course: ''
      });
      setHashtags([]);
      setHashtagInput('');
      setAttachments([]);
      setShowPreview(false);
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        content: '',
        cycle: '',
        course: ''
      });
      setHashtags([]);
      setHashtagInput('');
      setAttachments([]);
      setShowPreview(false);
      onClose();
    }
  };

  const handleCycleChange = (cycle: string) => {
    setFormData(prev => ({
      ...prev,
      cycle,
      course: '' // Reset course when cycle changes
    }));
  };

  const selectedCourse = courses.find(c => c.id === formData.course);

  // File handling functions
  const MAX_ATTACHMENTS = 5;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Check current attachment count
    if (attachments.length >= MAX_ATTACHMENTS) {
      alert(`Máximo ${MAX_ATTACHMENTS} archivos permitidos.`);
      return;
    }

    // Calculate how many more files we can add
    const remainingSlots = MAX_ATTACHMENTS - attachments.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(`Solo puedes agregar ${remainingSlots} archivo(s) más. Máximo ${MAX_ATTACHMENTS} en total.`);
    }

    filesToAdd.forEach(file => {
      if (!validateFileType(file)) {
        alert(`Tipo de archivo no permitido: ${file.name}`);
        return;
      }

      if (!validateFileSize(file, 30)) {
        alert(`El archivo ${file.name} es demasiado grande. Máximo 30MB.`);
        return;
      }

      const newAttachment = createFileAttachment(file);
      setAttachments(prev => [...prev, newAttachment]);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Hashtag handling functions
  const addHashtag = (tag: string) => {
    const cleanTag = tag.trim().replace(/^#/, '').toLowerCase();
    // Limit each hashtag to 15 characters
    const truncatedTag = cleanTag.substring(0, 15);
    if (truncatedTag && !hashtags.includes(truncatedTag) && hashtags.length < 10) {
      setHashtags(prev => [...prev, truncatedTag]);
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(prev => prev.filter(tag => tag !== tagToRemove));
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

  const attachmentMentions = attachments.map(att => ({
    id: att.name,
    display: att.name,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-7xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full max-h-[85vh]">
          {/* Left side - Form */}
          <div className="flex-1 flex flex-col border-r border-border">
            <div className="p-6 border-b border-border">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center space-x-2">
                    <PlusCircle className="h-5 w-5 text-primary" />
                    <span>Crear Nueva Publicación</span>
                  </DialogTitle>
                </div>
                <DialogDescription>
                  Comparte tu publicación con la comunidad estudiantil de UNAM
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cycle Selection */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <span>Ciclo</span>
                    </Label>
                    <Select
                      value={formData.cycle}
                      onValueChange={handleCycleChange}
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Selecciona un ciclo" />
                      </SelectTrigger>
                      <SelectContent>
                        {cycles.map((cycle) => (
                          <SelectItem key={cycle} value={cycle.toString()} className="cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="h-4 w-4 text-primary" />
                              <span>Ciclo {cycle}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Course Selection */}
                  <div className="space-y-2">
                    <Label>Curso</Label>
                    <Select
                      value={formData.course}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, course: value }))}
                      disabled={!formData.cycle}
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder={formData.cycle ? "Selecciona un curso" : "Primero selecciona un ciclo"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id} className="cursor-pointer">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{course.id}</span>
                              <span className="text-xs text-muted-foreground max-w-[300px] truncate">
                                {course.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selected Course Info */}
                {selectedCourse && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">{selectedCourse.id}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-primary">Ciclo {selectedCourse.cycle}</span>
                      <span className="text-muted-foreground hidden md:inline">-</span>
                      <span className="text-muted-foreground truncate hidden md:inline">{selectedCourse.name}</span>
                    </div>
                  </motion.div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="title">Título</Label>
                    <span className="text-xs text-muted-foreground">
                      {formData.title.length}/150
                    </span>
                  </div>
                  <Input
                    id="title"
                    placeholder="Ej: Busco tutor para el curso, Ofrezco servicios de programación..."
                    value={formData.title}
                    onChange={(e) => {
                      const processedValue = autoSpaceInsertion(e.target.value, 20);
                      setFormData(prev => ({ ...prev, title: processedValue }));
                    }}
                    required
                    maxLength={150}
                    className="text-base"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Descripción</Label>

                  {isMobile && showPreview ? (
                    <div className="min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" onClick={() => setShowPreview(false)}>
                      {formData.content ? (
                        <MarkdownRenderer attachments={attachments}>{formData.content}</MarkdownRenderer>
                      ) : (
                        <p className="text-muted-foreground">Escribe algo para ver la vista previa...</p>
                      )}
                    </div>
                  ) : (
                    <MentionsInput
                      inputRef={mentionsInputRef}
                      id="content"
                      value={formData.content}
                      onChange={(e) => {
                        // First, enforce the 700 character limit
                        let limitedValue = e.target.value.substring(0, 700);
                        // Limit consecutive line breaks to max 2 (one blank line)
                        limitedValue = limitedValue.replace(/\n{3,}/g, '\n\n');
                        // Then apply auto-space insertion
                        const processedValue = autoSpaceInsertion(limitedValue, 20);
                        setFormData(prev => ({ ...prev, content: processedValue }));
                      }}
                      placeholder="Describe detalladamente tu publicación. Usa Markdown y menciona archivos con '@'."
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
                    <span>{formData.content.length}/700</span>
                  </div>
                </div>

                <Accordion type="multiple" className="w-full">
                  {/* Hashtags */}
                  <AccordionItem value="hashtags">
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

                  {/* File Attachments */}
                  <AccordionItem value="attachments">
                    <AccordionTrigger className="cursor-pointer">
                      <Label className="flex items-center space-x-2 cursor-pointer">
                        <Upload className="h-4 w-4 text-primary" />
                        <span>Archivos adjuntos ({attachments.length})</span>
                      </Label>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-dashed border-2 h-20 flex flex-col items-center justify-center space-y-1 hover:bg-muted/50 w-full"
                        >
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Seleccionar archivos
                          </span>
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.zip,.rar,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx,.mp3,.wav,.ogg"
                          onChange={handleFileSelect}
                          className="hidden"
                        />

                        {attachments.length > 0 && (
                          <div className="space-y-2">
                            {attachments.map((attachment) => (
                              <motion.div
                                key={attachment.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-lg">{getFileIcon(attachment.type)}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate max-w-[200px]">{attachment.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(attachment.size)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(attachment.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Máximo 30MB por archivo - 5 archivos por post
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
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
                  onClick={handleSubmit}
                  disabled={!formData.title.trim() || !formData.content.trim() || !formData.course || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <PlusCircle className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? 'Publicando...' : 'Publicar'}
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
                  {(formData.title || formData.content || hashtags.length > 0 || attachments.length > 0 || selectedCourse) ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border border-border rounded-lg p-4 bg-card shadow-sm"
                    >
                      {selectedCourse && (
                        <div className="flex items-center space-x-2 text-xs text-primary mb-3 p-2 bg-primary/10 rounded-md">
                          <GraduationCap className="h-3 w-3" />
                          <span className="font-medium text-primary">{selectedCourse.id}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>Ciclo {selectedCourse.cycle}</span>
                        </div>
                      )}

                      {formData.title ? (
                        <h3 className="font-semibold text-lg mb-3 leading-tight break-words">{formData.title}</h3>
                      ) : (
                        <div className="h-6 bg-muted/50 rounded mb-3 animate-pulse"></div>
                      )}

                      <div className="prose prose-sm dark:prose-invert max-w-none mb-4 text-sm break-words">
                        <MarkdownRenderer attachments={attachments}>{formData.content || ""}</MarkdownRenderer>
                      </div>

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

                      {attachments.length > 0 && (
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="attachments-preview">
                            <AccordionTrigger className="cursor-pointer">
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Paperclip className="h-4 w-4" />
                                <span>{attachments.length} archivo{attachments.length > 1 ? 's' : ''} adjunto{attachments.length > 1 ? 's' : ''}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pt-2">
                                {attachments.map((attachment) => (
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

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1"><span>⬆️</span><span>0</span></div>
                          <div className="flex items-center space-x-1"><span>💬</span><span>0</span></div>
                        </div>
                        <span className="text-xs text-muted-foreground">Justo ahora</span>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Completa el formulario para ver la vista previa
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}