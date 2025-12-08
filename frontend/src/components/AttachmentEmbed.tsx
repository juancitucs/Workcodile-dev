import { FileAttachment, getFileIcon, formatFileSize, getAttachmentUrl } from './file-utils';
import { Button } from './ui/button';
import { Download, Paperclip } from 'lucide-react';
import { motion } from 'motion/react';

interface AttachmentEmbedProps {
  fileName: string;
  attachments: FileAttachment[];
}

export function AttachmentEmbed({ fileName, attachments }: AttachmentEmbedProps) {
  const attachment = attachments.find(att => att.name === fileName);

  if (!attachment) {
    return (
      <span className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 rounded p-2 border border-dashed mx-1">
        <Paperclip className="h-4 w-4" />
        <span>Adjunto no encontrado: {fileName}</span>
      </span>
    );
  }

  const url = getAttachmentUrl(attachment);
  const isImage = attachment.type.startsWith('image/');
  const isVideo = attachment.type.startsWith('video/');
  const isAudio = attachment.type.startsWith('audio/');

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (isImage && url) {
    return (
      <span className="inline-block mb-2 mr-2 relative group align-top">
        <img src={url} alt={attachment.name} className="max-w-[calc(50%-10px)] max-h-56 rounded-lg border object-contain" />
        <p className="text-xs text-center text-muted-foreground mt-1 max-w-[200px] truncate">{attachment.name}</p>
        {/* Download button for images */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-background/80 group-hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
          title={`Descargar ${attachment.name}`}
        >
          <Download className="h-4 w-4" />
        </Button>
      </span>
    )
  }

  if (isVideo && url) {
    return (
      <span className="inline-block mb-2 mr-2 relative group align-top max-w-[calc(50%-10px)]">
        <video src={url} controls className="max-w-full max-h-56 rounded-lg border" />
        <p className="text-xs text-center text-muted-foreground mt-1 max-w-[200px] truncate">{attachment.name}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-background/80 group-hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
          title={`Descargar ${attachment.name}`}
        >
          <Download className="h-4 w-4" />
        </Button>
      </span>
    )
  }

  if (isAudio && url) {
    return (
      <span className="inline-block mb-2 mr-2 relative group align-top max-w-[calc(50%-10px)]">
        <audio src={url} controls className="max-w-full rounded-lg border" />
        <p className="text-xs text-center text-muted-foreground mt-1 max-w-[200px] truncate">{attachment.name}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-background/80 group-hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
          title={`Descargar ${attachment.name}`}
        >
          <Download className="h-4 w-4" />
        </Button>
      </span>
    )
  }

  return (
    <motion.span
      whileHover={{ scale: 1.02, y: -1 }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      }}
      onClick={handleDownload}
      className="inline-flex items-center space-x-2 p-3 bg-gradient-to-r from-workcodile-gray-light/50 to-workcodile-gray-subtle/30 border border-workcodile-border-light rounded-md hover:from-workcodile-green-subtle/30 hover:to-workcodile-gray-subtle/50 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md mr-2 mb-2 align-top"
    >
      <span className="text-lg">{getFileIcon(attachment.type)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-xs text-muted-foreground">
          {attachment.size ? formatFileSize(attachment.size) : ''}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-primary/10"
      >
        <Download className="h-4 w-4" />
      </Button>
    </motion.span>
  );
}
