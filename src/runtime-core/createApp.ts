import { createVNode } from './createVNode';

export function createAppApi(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 先转 vnode
        // component -> vnode
        // 后续所有的操作 都会基于vnode处理
        const vnode = createVNode(rootComponent);
        render(vnode, rootContainer);
      },
    };
  };
}
