import { createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/ShapeFlags';
import { Fragment, Text } from './createVNode';
import { createAppApi } from './createApp';
import { effect } from '../reactivity/index';
import { shouleUpdateComponent } from './componentUpdateUtils';
import { queueJobs } from './scheduler';

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
    let i = 0; //开始
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
    //3.新的比老的多创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
      //4. 老的节点比新的多
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      debugger;
      //乱序: 中间对比
      //1.先把新的下标和key存储起来
      //2.遍历老的节点 如果在新的里边找到， 则更新， 如果没找到 则删除
      let s1 = i; //老节点的开始
      let s2 = i;
      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      const keyToNewIndexMap = new Map();
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (let i = 0; i < toBePatched; i++) {
        newIndexToOldIndexMap[i] = 0;
      }
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }
        // null undefined
        let newIndex; //当前节点在新的节点里的下标
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j < e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;

          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      //寻找最长递增子序列
      const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
      let j = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else {
          if (i !== increasingNewIndexSequence[j]) {
            console.log('移动位置');
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }
  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component);

    if (shouleUpdateComponent(n1, n2)) {
      // instance.update();
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  function mountComponent(initalVNode, container, parentComponent, anchor) {
    const instance = (initalVNode.component = createComponentInstance(initalVNode, parentComponent));
    setupComponent(instance);
    setupRenderEffect(instance, initalVNode, container, anchor);
  }

  function setupRenderEffect(instance, initalVNode, container, anchor) {
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          console.log(instance.render);
          const subTree = (instance.subTree = instance.render.call(instance.proxy, instance.proxy));
          //vnode
          patch(null, subTree, container, instance, anchor);

          //这里 element => mount
          initalVNode.el = subTree.el;
          console.log(instance, 'initalVNode');
          instance.isMounted = true;
        } else {
          const { next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }
          const subTree = instance.render.call(instance.proxy, instance.proxy);
          const prevSubTree = instance.subTree;
          //这里对比
          // instance.subTree = subTree;/
          instance.subTree = subTree;
          console.log(prevSubTree, 'prevSubTree');
          console.log(subTree, 'subTree');

          patch(prevSubTree, subTree, container, instance, anchor);
        }
      },
      {
        scheduler() {
          console.log('update scr');
          queueJobs(instance.update);
        },
      }
    );
  }
  return {
    createApp: createAppApi(render),
  };
}
function updateComponentPreRender(instance, nextVnode) {
  instance.vnode = nextVnode;
  instance.next = null;
  instance.props = nextVnode.props;
}
function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
