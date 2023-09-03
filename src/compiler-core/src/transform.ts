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
  const child = root.children[0];
  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode;
  } else {
    root.codegenNode = root.children[0];
  }
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
  const exitFns: any = [];
  for (let i = 0; i < nodeTranforms.length; i++) {
    const transform = nodeTranforms[i];
    const onExit = transform(node, context);
    if (onExit) {
      exitFns.push(onExit);
    }
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
  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}

function traverseChildren(node, context) {
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    traversNode(node, context);
  }
}
