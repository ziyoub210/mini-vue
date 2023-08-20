import { createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/ShapeFlags';
import { Fragment, Text } from './createVNode';
import { createAppApi } from './createApp';
import { effect } from '../reactivity/index';

export function createRender(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null, null);
  }

  function patch(n1, n2, container, parentComponent, anchor) {
    // element类型
    // if (typeof vnode.type === 'string') {
    //
    const { type, shapeFlag } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          //组件类型
          processComponent(n1, n2, container, parentComponent, anchor);
        }
    }
  }
  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processText(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      //初始化
      mountElement(n1, n2, container, parentComponent, anchor);
    } else {
      //更新

      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  function mountElement(n1, n2, container, parentComponent, anchor) {
    // const el = (vnode.el = document.createElement(vnode.type));
    const el = (n2.el = hostCreateElement(n2.type));
    const { children, shapeFlag } = n2;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent, anchor);
    }
    const { props } = n2;
    for (const key in props) {
      const value = props[key];
      hostPatchProp(el, key, null, value);
    }
    hostInsert(el, container, anchor);
  }
  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    const el = (n2.el = n1.el);

    patchProps(el, oldProps, newProps);

    patchChildren(n1, n2, el, parentComponent, anchor);
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

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    //新的是个文本节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      //老节点是个数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(n1.children);
      }
      if (n1.children !== n2.chidren) {
        hostSetElementText(container, n2.children);
      }
    } else {
      //新的是文本 老的是数组
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '');
        mountChildren(n2.children, container, parentComponent, anchor);
      } else {
        patchKeyedChildren(n1.children, n2.children, container, parentComponent, anchor);
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    const l1 = c1.length;
    const l2 = c2.length;
    let i = 0;
    let e1 = l1 - 1;
    let e2 = l2 - 1;

    function isSomeVNodeType(n1, n2) {
      //type
      //key
      return n1.type === n2.type && n1.key === n2.key;
    }
    //左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]; //老的
      const n2 = c2[i]; //新的

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }
    console.log(i);
    //右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]; //老的
      const n2 = c2[e2]; //新的

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    console.log(e1, e2);

    //3.新的比老的多创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        console.log(anchor, 'anchor');
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      //乱序
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor);
  }

  function mountComponent(initalVNode, container, parentComponent, anchor) {
    const instance = createComponentInstance(initalVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initalVNode, container, anchor);
  }

  function setupRenderEffect(instance, initalVNode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        const subTree = (instance.subTree = instance.render.call(instance.proxy));
        //vnode
        patch(null, subTree, container, instance, anchor);

        //这里 element => mount
        initalVNode.el = subTree.el;
        console.log(instance, 'initalVNode');
        instance.isMounted = true;
      } else {
        const subTree = instance.render.call(instance.proxy);

        const prevSubTree = instance.subTree;
        //这里对比
        // instance.subTree = subTree;/
        instance.subTree = subTree;
        console.log(prevSubTree, 'prevSubTree');
        console.log(subTree, 'subTree');

        patch(prevSubTree, subTree, container, instance, anchor);
      }
    });
  }
  return {
    createApp: createAppApi(render),
  };
}
