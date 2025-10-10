import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useApp } from './app-context';
import { FileAttachment, createFileAttachment, formatFileSize, getFileIcon, validateFileType, validateFileSize } from './file-utils';
import { PlusCircle, X, GraduationCap, Upload, FileText, Hash, Trash2 } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}



export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { createPost, courses, getCoursesByCycle } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const cycles = Array.from({ length: 10 }, (_, i) => i + 1);
  const availableCourses = formData.cycle ? getCoursesByCycle(parseInt(formData.cycle)) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.course) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    createPost(formData.title, formData.content, formData.course, hashtags, attachments);
    
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
    
    setIsSubmitting(false);
    onClose();
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
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!validateFileType(file)) {
        alert(`Tipo de archivo no permitido: ${file.name}`);
        return;
      }

      if (!validateFileSize(file, 10)) {
        alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`);
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
    if (cleanTag && !hashtags.includes(cleanTag) && hashtags.length < 10) {
      setHashtags(prev => [...prev, cleanTag]);
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <DialogDescription>
                  Comparte tu publicación con la comunidad estudiantil de UNAM
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cycle Selection */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Ciclo</span>
            </Label>
            <Select
              value={formData.cycle}
              onValueChange={handleCycleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un ciclo" />
              </SelectTrigger>
              <SelectContent>
                {cycles.map((cycle) => (
                  <SelectItem key={cycle} value={cycle.toString()}>
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
          <div className="space-y-3">
            <Label>Curso</Label>
            <Select
              value={formData.course}
              onValueChange={(value) => setFormData(prev => ({ ...prev, course: value }))}
              disabled={!formData.cycle}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.cycle ? "Selecciona un curso" : "Primero selecciona un ciclo"} />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
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

          {/* Selected Course Info */}
          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-primary/10 border border-primary/20 rounded-lg"
            >
              <div className="flex items-center space-x-2 text-sm">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">{selectedCourse.id}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-primary">Ciclo {selectedCourse.cycle}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedCourse.name}
              </p>
            </motion.div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ej: Busco tutor para el curso, Ofrezco servicios de programación..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/150 caracteres
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Descripción</Label>
            <Textarea
              id="content"
              placeholder="Describe detalladamente tu publicación. Incluye información relevante como horarios, precios, requisitos, etc."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {formData.content.length}/1000 caracteres
            </p>
          </div>

          {/* Hashtags */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-primary" />
              <span>Hashtags (opcional)</span>
            </Label>
            <div className="space-y-2">
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
                      className="text-xs flex items-center space-x-1 bg-primary/10 text-primary border-primary/20"
                    >
                      <Hash className="h-3 w-3" />
                      <span>{tag}</span>
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
                {hashtags.length}/10 hashtags • Presiona Enter o Espacio para agregar
              </p>
            </div>
          </div>

          {/* File Attachments */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-2">
              <Upload className="h-4 w-4 text-primary" />
              <span>Archivos adjuntos (opcional)</span>
            </Label>
            <div className="space-y-2">
              <div className="flex flex-col space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-dashed border-2 h-20 flex flex-col items-center justify-center space-y-1 hover:bg-muted/50"
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
                  accept=".pdf,.zip,.rar,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
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
                Tipos permitidos: PDF, ZIP, RAR, JPG, PNG, GIF, TXT, DOC, DOCX • Máximo 10MB por archivo
              </p>
            </div>
          </div>

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
          <div className="w-[400px] flex flex-col bg-muted/20">
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
                        <span className="font-medium">{selectedCourse.id}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>Ciclo {selectedCourse.cycle}</span>
                      </div>
                    )}
                    
                    {formData.title ? (
                      <h3 className="font-semibold text-lg mb-3 leading-tight">{formData.title}</h3>
                    ) : (
                      <div className="h-6 bg-muted/50 rounded mb-3 animate-pulse"></div>
                    )}
                    
                    {formData.content ? (
                      <p className="text-muted-foreground whitespace-pre-wrap mb-4 text-sm leading-relaxed">
                        {formData.content}
                      </p>
                    ) : (
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
                        <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-muted/50 rounded w-1/2 animate-pulse"></div>
                      </div>
                    )}
                    
                    {hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {hashtags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">Archivos adjuntos:</p>
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
                    )}
                    
                    {/* Post actions preview */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <span>⬆️</span>
                          <span>0</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>💬</span>
                          <span>0</span>
                        </div>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}