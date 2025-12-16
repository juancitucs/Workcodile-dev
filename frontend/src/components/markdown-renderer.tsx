import ReactMarkdown, { Components, ParagraphProps } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import { remarkAttachmentPlugin } from './remark-attachment-plugin';
import { AttachmentEmbed } from './AttachmentEmbed';
import { FileAttachment } from './types';
import React from 'react';

interface MarkdownRendererProps {
  children: string;
  attachments?: FileAttachment[];
}

const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'attachment'],
  attributes: {
    ...defaultSchema.attributes,
    attachment: ['fileName'],
  },
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({ children, attachments = [] }) => {
  const markdownSource = children;

  const customComponents: Components = {
    p: ({ node, children, ...props }: ParagraphProps) => {
      const containsAttachments = node.children.some(child => (child as any).type === 'attachment');

      if (containsAttachments) {
        return (
          <div className="flex flex-wrap gap-x-2 gap-y-2 items-start" {...props}>
            {children}
          </div>
        );
      }
      return <p {...props}>{children}</p>;
    },
    attachment({ node, ...props }: any) {
      const fileName = props.fileName;
      const attachment = attachments.find(att => att.name === fileName);
      const key = attachment?.object_key || fileName; // Use object_key as key for stability
      return <span><AttachmentEmbed key={key} fileName={fileName} attachments={attachments} /></span>;
    },
    em: ({ node, ...props }) => {
      const startOffset = node?.position?.start?.offset;
      const endOffset = node?.position?.end?.offset;
      
      if (startOffset === undefined || endOffset === undefined) {
        return <em {...props} />;
      }

      const originalText = markdownSource.substring(startOffset, endOffset);
      if (originalText.startsWith('*')) {
        return <strong {...props} />;
      }
      return <em {...props} />;
    },
    img: ({ node, ...props }) => {
      // Ensure images are constrained within the container and fit well.
      // Use max-h-60 (240px) and object-contain to ensure the image is visible
      // and contained within the truncated area, while preserving aspect ratio.
      return <img {...props} className="max-h-60 w-auto object-contain mx-auto" />;
    },
  };

  return (
    <div className="prose dark:prose-invert max-w-none break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkAttachmentPlugin]}
        rehypePlugins={[[rehypeSanitize, schema], rehypeKatex, rehypeHighlight]}
        components={customComponents}
      >
        {markdownSource}
      </ReactMarkdown>
    </div>
  );
});

export default MarkdownRenderer;

