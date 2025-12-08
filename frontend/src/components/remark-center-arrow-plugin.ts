import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';

function remarkCenterArrowPlugin() {
  return (tree: Node) => {
    visit(tree, 'paragraph', (node: any, index: number, parent: Parent) => {
      if (node.children.length === 0) {
        return;
      }

      const firstChild = node.children[0];
      const lastChild = node.children[node.children.length - 1];

      const startsWithArrow = firstChild.type === 'text' && firstChild.value.startsWith('->');
      const endsWithArrow = lastChild.type === 'text' && lastChild.value.endsWith('<-');

      if (startsWithArrow && endsWithArrow) {
        // Trim the markers
        firstChild.value = firstChild.value.slice(2).trimStart();
        lastChild.value = lastChild.value.slice(0, -2).trimEnd();
        
        // Add data to the paragraph node to transform it into a div
        const data = node.data || (node.data = {});
        data.hName = 'div';
        data.hProperties = { className: ['text-center-directive'] };
      }
    });
  };
}

export { remarkCenterArrowPlugin };
