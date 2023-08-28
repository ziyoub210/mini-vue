import { NodeTypes } from './ast';

export function transform(root, options) {
  const context = createTransformContext(root, options);
  //1. 遍历- 深度有限搜索
  traversNode(root, context);
}

function createTransformContext(root: any, options: any): any {
  const context = {
    root,
    nodeTranforms: options.nodeTransforms,
  };
  return context;
}

function traversNode(node: any, context) {
  console.log(node);
  const nodeTranforms = context.nodeTranforms;
  for (let i = 0; i < nodeTranforms.length; i++) {
    const nodeTransform = nodeTranforms[i];
    nodeTransform(node);
  }
  const children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traversNode(node, context);
    }
  }
}
