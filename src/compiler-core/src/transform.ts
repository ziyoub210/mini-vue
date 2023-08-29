import { NodeTypes } from './ast';
import { TO_DISPLAY_STRING } from './runtimeHelplers';

export function transform(root, options = {}) {
  const context = createTransformContext(root, options);
  //1. 遍历- 深度有限搜索
  traversNode(root, context);

  createRootCodegen(root);
  root.helpers = [...context.helpers.keys()];
}

function createRootCodegen(root: any) {
  root.codegenNode = root.children[0];
}

function createTransformContext(root: any, options: any): any {
  const context = {
    root,
    nodeTranforms: options.nodeTransforms,
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1);
    },
  };
  return context;
}

function traversNode(node: any, context) {
  const nodeTranforms = context.nodeTranforms || [];
  for (let i = 0; i < nodeTranforms.length; i++) {
    const transform = nodeTranforms[i];
    transform(node);
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node, context);
      break;
  }
}

function traverseChildren(node, context) {
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    traversNode(node, context);
  }
}
