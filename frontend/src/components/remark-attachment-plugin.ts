import { visit } from 'unist-util-visit';
import { VFile } from 'vfile';
import { Parent, Point, Position } from 'unist';

const attachmentRegex = /@"([^"]+)"/g;

export function remarkAttachmentPlugin() {
  return (tree: Parent, file: VFile) => {
    visit(tree, 'text', (node: any, index: number | null, parent: Parent | null) => {
      if (!parent || typeof index !== 'number') return;

      const text = node.value;
      const matches = [...text.matchAll(attachmentRegex)];

      if (matches.length > 0) {
        let lastIndex = 0;
        const newChildren = [];

        for (const match of matches) {
          const matchedText = match[0];
          const fileName = match[1];
          const matchIndex = match.index!;

          // Add text before the match
          if (matchIndex > lastIndex) {
            newChildren.push({ type: 'text', value: text.substring(lastIndex, matchIndex) });
          }

          // Add the custom attachment node
          newChildren.push({
            type: 'attachment',
            value: fileName,
            data: { hName: 'attachment', hProperties: { fileName } }
          });

          lastIndex = matchIndex + matchedText.length;
        }

        // Add any remaining text after the last match
        if (lastIndex < text.length) {
          newChildren.push({ type: 'text', value: text.substring(lastIndex) });
        }

        // Replace the original text node with the new set of nodes
        parent.children.splice(index, 1, ...newChildren);
        return [visit.SKIP, index + newChildren.length]; // Skip the new nodes and continue after them
      }
    });
  };
}
