import { createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/ShapeFlags';
import { Fragment, Text } from './createVNode';
import { createAppApi } from './createApp';
import { effect } from '../reactivity/index';

export function createRender(options) {
  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null);
  }

  function patch(n1, n2, container, parentComponent) {
    // element类型
    // if (typeof vnode.type === 'string') {
    //
    const { type, shapeFlag } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          //组件类型
          processComponent(n1, n2, container, parentComponent);
        }
    }
  }
  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2.children, container, parentComponent);
  }

  function processText(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      //初始化
      mountElement(n1, n2, container, parentComponent);
    } else {
      //更新

      patchElement(n1, n2, container);
    }
  }
  function mountChildren(children, container, parentComponent) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent);
    });
  }

  function mountElement(n1, n2, container, parentComponent) {
    // const el = (vnode.el = document.createElement(vnode.type));
    const el = (n2.el = hostCreateElement(n2.type));
    const { children, shapeFlag } = n2;
    // if (typeof children === 'string') {
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent);
    }
    const { props } = n2;
    for (const key in props) {
      const value = props[key];
      // const isOn = (key: string) => /^on[A-Z]/.test(key);
      // if (isOn(key)) {
      //   const event = key.slice(2).toLocaleLowerCase();
      //   el.addEventListener(event, value);
      // } else {
      //   el.setAttribute(key, value);
      // }
      hostPatchProp(el, key, null, value);
    }
    // container.append(el);
    hostInsert(el, container);
  }
  function patchElement(n1, n2, container) {
    console.log('n1', n1);
    console.log('n2', n2);

    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    const el = (n2.el = n1.el);

    patchProps(el, oldProps, newProps);
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }

      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
  }

  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent);
  }

  function mountComponent(initalVNode, container, parentComponent) {
    const instance = createComponentInstance(initalVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initalVNode, container);
  }

  function setupRenderEffect(instance, initalVNode, container) {
    effect(() => {
      if (!instance.isMounted) {
        console.log('初始化');
        const subTree = (instance.subTree = instance.render.call(instance.proxy));
        //vnode
        patch(null, subTree, container, instance);

        //这里 element => mount
        initalVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        const subTree = instance.render.call(instance.proxy);

        const prevSubTree = instance.subTree;
        //这里对比
        // instance.subTree = subTree;/
        instance.subTree = subTree;

        patch(prevSubTree, subTree, container, instance);
      }
    });
  }
  return {
    createApp: createAppApi(render),
  };
}
