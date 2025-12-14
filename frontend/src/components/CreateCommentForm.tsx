import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { useApp } from './app-context';
import { FileAttachment, createFileAttachment, validateFileType, validateFileSize } from './file-utils';
import { Paperclip, Eye } from 'lucide-react';
import { MentionsInput, Mention } from 'react-mentions';
import mentionsInputStyle from './mentions-input-style';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Card } from './ui/card';
import MarkdownRenderer from './markdown-renderer';
import { autoSpaceInsertion } from '../utils/text-utils';

// ADAPTED FROM create-post-modal.tsx FOR COMMENTS

interface CreateCommentFormProps {
  postId: string;
  parentId?: string;
  onCommentSubmitted: () => void; // Callback to handle UI changes after submission
}

// This function implements the user's requested logic for "smart" attachment uploads.
const uploadReferencedFiles = async (
  attachments: FileAttachment[],
  commentText: string
): Promise<(Omit<FileAttachment, 'id'> & { object_key: string })[]> => {
  // 1. Parse commentText to find all "@filename" references.
  const mentionedFilePattern = /@"([^"]+)"/g;
  const mentionedFilenames = new Set<string>();
  let match;
  while ((match = mentionedFilePattern.exec(commentText)) !== null) {
    mentionedFilenames.add(match[1]);
  }

  if (mentionedFilenames.size === 0) {
    return []; // No files mentioned, no uploads needed.
  }

  // 2. Filter the `FileAttachment` array to only include files that were referenced.
  const filesToUpload = attachments
    .map(att => att.file)
    .filter(file => file && mentionedFilenames.has(file.name)) as File[];

  if (filesToUpload.length === 0) {
    return [];
  }

  // 3. Upload only the referenced files.
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const uploadedAttachmentsData = await uploadReferencedFiles(attachments, content);
      await addComment(postId, content, parentId, uploadedAttachmentsData);
      setContent('');
      setAttachments([]);
      setShowPreview(false);
      onCommentSubmitted();
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
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
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="space-y-2">
          {showPreview ? (
            <div
              className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setShowPreview(false)}
            >
              {content ? (
                <MarkdownRenderer attachments={attachments}>{content}</MarkdownRenderer>
              ) : (
                <p className="text-muted-foreground">Escribe algo para ver la vista previa...</p>
              )}
            </div>
          ) : (
            <MentionsInput
              inputRef={mentionsInputRef}
              id="content"
              value={content}
              onChange={(e) => {
                const processedValue = autoSpaceInsertion(e.target.value, 20);
                setContent(processedValue);
              }}
              placeholder="Escribe un comentario. Usa Markdown y menciona archivos con '@'."
              style={mentionsInputStyle}
              className="min-h-[120px] resize-y"
            >
              <Mention
                trigger="@"
                data={attachmentMentions}
                markup={`@"__display__"`}
                displayTransform={(id, display) => `@${display}`}
              />
            </MentionsInput>
          )}
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-muted-foreground"
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showPreview ? 'Ocultar' : 'Mostrar'} vista previa</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.zip,.rar,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx,.mp3,.wav,.ogg"
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
