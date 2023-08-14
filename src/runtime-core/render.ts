import { isObject } from '../shared/index';
import { createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/ShapeFlags';
import { Fragment, Text } from './createVNode';
export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // element类型
  // if (typeof vnode.type === 'string') {
  //
  const { type, shapeFlag } = vnode;

  switch (type) {
    case Fragment:
      processFragment(vnode, container);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        //组件类型
        processComponent(vnode, container);
      }
  }
}
function processFragment(vnode, container) {
  mountChildren(vnode.children, container);
}

function processText(vnode, container) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}

function processElement(vnode, container) {
  //初始化
  mountElement(vnode, container);
  //更新
}
function mountChildren(children, container) {
  children.forEach((v) => {
    patch(v, container);
  });
}

function mountElement(vnode, container) {
  const el = (vnode.el = document.createElement(vnode.type));
  const { children, shapeFlag } = vnode;
  // if (typeof children === 'string') {
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el);
  }
  const { props } = vnode;
  for (const key in props) {
    const value = props[key];
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLocaleLowerCase();
      el.addEventListener(event, value);
    } else {
      el.setAttribute(key, value);
    }
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
