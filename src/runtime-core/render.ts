import { isObject } from '../shared/index';
import { createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/ShapeFlags';
export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // element类型
  // if (typeof vnode.type === 'string') {
  //
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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
  const el = (vnode.el = document.createElement(vnode.type));
  const { children, shapeFlag } = vnode;
  // if (typeof children === 'string') {
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    children.forEach((v) => {
      mountElement(v, el);
    });
  }
  const { props } = vnode;
  for (const key in props) {
    const value = props[key];
    el.setAttribute(key, value);
  }
  container.append(el);
}

function processComponent(vnode, container) {
  mountComponent(vnode, container);
}

function mountComponent(initalVNode, container) {
  const instance = createComponentInstance(initalVNode);
  setupComponent(instance);
  setupRenderEffect(instance, initalVNode, container);
}

function setupRenderEffect(instance, initalVNode, container) {
  const subTree = instance.render.call(instance.proxy);
  //vnode
  patch(subTree, container);

  //这里 element => mount
  initalVNode.el = subTree.el;
}
