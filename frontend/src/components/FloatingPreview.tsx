import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import MarkdownRenderer from './markdown-renderer';
import { FileText, X } from 'lucide-react';
import { Button } from './ui/button';
import { FileAttachment } from './types';

interface FloatingPreviewProps {
  content: string;
  attachments: FileAttachment[];
  onClose: () => void;
}

export function FloatingPreview({ content, attachments, onClose }: FloatingPreviewProps) {
  return (
    <Card className="absolute bottom-full left-0 mb-2 z-50 w-full max-w-lg bg-card/80 backdrop-blur-lg border-border shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <CardTitle className="text-base font-medium flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Vista Previa</span>
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 max-h-[400px] overflow-y-auto">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {content ? (
            <MarkdownRenderer attachments={attachments}>
              {content}
            </MarkdownRenderer>
          ) : (
            <p className="text-muted-foreground">Escribe algo para ver la vista previa...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
