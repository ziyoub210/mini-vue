import { createComponentInstance, setupComponent } from './component';
export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // 去处理组件

  //判断 是不是element类型
  processComponent(vnode, container);
}

function processComponent(vnode, container) {
  mountComponent(vnode, container);
}

function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render();
  //vnode
  patch(subTree, container);
}
