import { createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/ShapeFlags';
import { Fragment, Text } from './createVNode';
export function render(vnode, container) {
  patch(vnode, container, null);
}

function patch(vnode, container, parentComponent) {
  // element类型
  // if (typeof vnode.type === 'string') {
  //
  const { type, shapeFlag } = vnode;

  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        //组件类型
        processComponent(vnode, container, parentComponent);
      }
  }
}
function processFragment(vnode, container, parentComponent) {
  mountChildren(vnode.children, container, parentComponent);
}

function processText(vnode, container) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}

function processElement(vnode, container, parentComponent) {
  //初始化
  mountElement(vnode, container, parentComponent);
  //更新
}
function mountChildren(children, container, parentComponent) {
  children.forEach((v) => {
    patch(v, container, parentComponent);
  });
}

function mountElement(vnode, container, parentComponent) {
  const el = (vnode.el = document.createElement(vnode.type));
  const { children, shapeFlag } = vnode;
  // if (typeof children === 'string') {
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el, parentComponent);
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

function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}

function mountComponent(initalVNode, container, parentComponent) {
  const instance = createComponentInstance(initalVNode, parentComponent);
  setupComponent(instance);
  setupRenderEffect(instance, initalVNode, container);
}

function setupRenderEffect(instance, initalVNode, container) {
  const subTree = instance.render.call(instance.proxy);
  //vnode
  patch(subTree, container, instance);

  //这里 element => mount
  initalVNode.el = subTree.el;
}
