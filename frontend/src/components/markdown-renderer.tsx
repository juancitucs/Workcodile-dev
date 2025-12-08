import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import { remarkCenterArrowPlugin } from './remark-center-arrow-plugin';
import { remarkAttachmentPlugin } from './remark-attachment-plugin';
import { AttachmentEmbed } from './AttachmentEmbed';
import { FileAttachment } from './types';

interface MarkdownRendererProps {
  children: string;
  attachments?: FileAttachment[];
}

const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'attachment', 'div'],
  attributes: {
    ...defaultSchema.attributes,
    attachment: ['fileName'],
    div: ['class'],
  },
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children, attachments = [] }) => {
  const markdownSource = children;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath, remarkAttachmentPlugin, remarkCenterArrowPlugin]}
      rehypePlugins={[[rehypeSanitize, schema], rehypeKatex, rehypeHighlight]}
      components={{
        attachment({ node, ...props }: any) {
          const fileName = props.fileName;
          return <AttachmentEmbed fileName={fileName} attachments={attachments} />;
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
      }}
    >
      {markdownSource}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;

