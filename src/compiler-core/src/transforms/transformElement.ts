import { NodeTypes } from '../ast';
import { CREATE_ELEMENT_VNODE } from '../runtimeHelplers';
export function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      context.helper(CREATE_ELEMENT_VNODE);
      //中间处理层
      //tag
      const vnodeTag = `'${node.tag}'`;

      //props
      let vnodeProps;

      const chilren = node.children;
      let vnodeChilren = chilren[0];

      const vnodeElement = {
        type: NodeTypes.ELEMENT,
        tag: vnodeTag,
        props: vnodeProps,
        children: vnodeChilren,
      };

      node.codegenNode = vnodeElement;
    };
  }
}
