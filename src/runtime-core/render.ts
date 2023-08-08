import { isObject } from '../shared/index';
import { createComponentInstance, setupComponent } from './component';
export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // element类型
  if (typeof vnode.type === 'string') {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    //组件类型
    processComponent(vnode, container);
  }
}
function processElement(vnode, container) {
  //初始化
  mountElement(vnode, container);
  //更新
}
function mountElement(vnode, container) {
  const el = document.createElement(vnode.type);
  const { children } = vnode;
  if (typeof children === 'string') {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach((v) => {
      mountElement(v, el);
    });
  }
  const { props } = vnode;
  for (const key in props) {
    const value = props[key];
    el.setAttribute(key, value);
  }
  console.log(el);
  container.append(el);
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
