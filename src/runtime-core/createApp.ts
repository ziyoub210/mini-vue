import { createVNode } from './createVNode';
import { render } from './render';
export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 先转 vnode
      // component -> vnode
      // 后续所有的操作 都会基于vnode处理
      const vnode = createVNode(rootContainer);
      render(vnode, rootContainer);
    },
  };
}
