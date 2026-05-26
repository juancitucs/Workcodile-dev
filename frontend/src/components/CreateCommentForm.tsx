import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { useApp } from './app-context';
import { FileAttachment, createFileAttachment, validateFileType, validateFileSize } from './file-utils';
import { Paperclip, X, File as FileIcon } from 'lucide-react';
import { MentionsInput, Mention } from 'react-mentions';
import mentionsInputStyle from './mentions-input-style';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Card } from './ui/card';
import { autoSpaceInsertion } from '../utils/text-utils';

// ADAPTED FROM create-post-modal.tsx FOR COMMENTS

interface CreateCommentFormProps {
  postId: string;
  parentId?: string;
  onCommentSubmitted: () => void; // Callback to handle UI changes after submission
}

// Upload ALL attached files (not just mentioned ones)
const uploadAllFiles = async (
  attachments: FileAttachment[]
): Promise<(Omit<FileAttachment, 'id'> & { object_key: string })[]> => {
  if (attachments.length === 0) {
    return [];
  }

  const filesToUpload = attachments
    .map(att => att.file)
    .filter((file): file is File => file !== undefined);

  if (filesToUpload.length === 0) {
    return [];
  }

  return await uploadFiles(filesToUpload);
};


const sanitizeFilename = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  const filenameBody = lastDot === -1 ? filename : filename.substring(0, lastDot);
  const extension = lastDot === -1 ? '' : filename.substring(lastDot);
  let sanitized = filenameBody.replace(/[^a-zA-Z0-9_-]+/g, '_');
  sanitized = sanitized.replace(/^_+|_+$/g, '');
  if (!sanitized) {
    sanitized = 'file';
  }
  return sanitized + extension;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const uploadFiles = async (files: File[]): Promise<(Omit<FileAttachment, 'id'> & { object_key: string })[]> => {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    const sanitizedFilename = sanitizeFilename(file.name);
    formData.append('file', file, sanitizedFilename);

    try {
      const response = await fetch(`${API_BASE_URL}/api/storage`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token') || '',
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Error uploading file: ${file.name}`);
      }
      const result = await response.json();
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        object_key: result.objectName,
        url: result.url,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);
  return results.filter((result): result is (Omit<FileAttachment, 'id'> & { object_key: string }) => result !== null);
};


export function CreateCommentForm({ postId, parentId, onCommentSubmitted }: CreateCommentFormProps) {
  const { addComment } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mentionsInputRef = useRef<any>(null);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const uploadedAttachmentsData = await uploadAllFiles(attachments);
      await addComment(postId, content, parentId, uploadedAttachmentsData);
      setContent('');
      setAttachments([]);
      onCommentSubmitted();
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const MAX_FILES = 4;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_FILES - attachments.length;
    if (remainingSlots <= 0) {
      alert(`Máximo ${MAX_FILES} archivos por comentario.`);
      return;
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots);

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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const attachmentMentions = attachments.map(att => ({
    id: att.name,
    display: att.name,
  }));

  return (
    <Card className="p-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Live preview area - shows how comment will look */}
        <div className="border rounded-md p-3 min-h-[60px] bg-background">
          {/* Inline images preview */}
          {attachments.length > 0 && (() => {
            const images = attachments.filter(a => a.type.startsWith('image/'));
            const otherFiles = attachments.filter(a => !a.type.startsWith('image/'));
            const firstImage = images[0];
            const restImages = images.slice(1);

            return (
              <div className="flex flex-wrap gap-2 mb-2">
                {/* First image - will be visible inline */}
                {firstImage && (
                  <div className="relative group">
                    <div className="ring-2 ring-primary ring-offset-2 rounded">
                      <img src={firstImage.url} alt={firstImage.name} className="max-h-32 max-w-[200px] object-contain rounded" />
                    </div>
                    <span className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">Visible</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter(a => a.name !== firstImage.name))}
                      className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Other images (will be in attachments) - show as file name only */}
                {restImages.map((att, idx) => (
                  <div key={`img-${idx}`} className="relative group">
                    <div className="h-12 px-3 flex items-center gap-2 bg-muted/50 rounded border border-dashed">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs truncate max-w-[120px]">{att.name}</span>
                      <span className="text-[10px] text-muted-foreground">(adjunto)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter(a => a.name !== att.name))}
                      className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Other files */}
                {otherFiles.map((att, idx) => (
                  <div key={`file-${idx}`} className="relative group">
                    <div className="h-12 px-3 flex items-center gap-2 bg-muted rounded">
                      <FileIcon className="h-4 w-4" />
                      <span className="text-xs">{att.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter(a => a.name !== att.name))}
                      className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Text input */}
          <MentionsInput
            inputRef={mentionsInputRef}
            id="content"
            value={content}
            onChange={(e) => {
              const processedValue = autoSpaceInsertion(e.target.value, 20);
              setContent(processedValue);
            }}
            placeholder="Escribe un comentario..."
            style={{
              ...mentionsInputStyle,
              control: { ...mentionsInputStyle.control, border: 'none' },
              '&multiLine': { ...mentionsInputStyle['&multiLine'], control: { ...mentionsInputStyle['&multiLine'].control, minHeight: 40 } }
            }}
          >
            <Mention
              trigger="@"
              data={attachmentMentions}
              markup={`@"__display__"`}
              displayTransform={(id, display) => `@${display}`}
            />
          </MentionsInput>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-muted-foreground"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adjuntar archivo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.zip,.rar,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx,.mp3A,.wav,.ogg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
