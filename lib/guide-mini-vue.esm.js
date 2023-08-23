const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
        // 0001  | 1000
        // 1001
    }
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

const publicProertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const PublicInsatnceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // if (key in instance.setupState) {
        //   return Reflect.get(instance.setupState, key);
        // }
        const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicProertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
function hasChanged(val, newVal) {
    return !Object.is(val, newVal);
}
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
//add-foo => addFoo
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const toHandlerKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};

function emit(instance, event, ...args) {
    const { props } = instance;
    //TDD
    //先去写一个特定的行为 =》 重构成通用的行为
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

//全局变量 保存当前正在调用的effect
let activeEffect;
let shouldTrack; //是否应该收集依赖
class ReactivityEffect {
    constructor(fn, options) {
        this.active = true;
        this.deps = []; //反向收集的依赖
        this._fn = fn;
        extend(this, options);
        //保存调度器函数 如果有的话 在trigger触发时会执行这个
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            this.active = false;
            this.onStop && this.onStop();
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
/**
 * 这里进行依赖收集
 * 收集起来的依赖 使用 Map 来存储
 * 结构为 Map({ target: Map({ key: set(effect1, effect2) })})
 */
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    if (!activeEffect)
        return;
    tractEffects(dep);
}
function tractEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
/** 当属性set时进行触发更新 将收集好的依赖全都在执行一遍 */
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options = {}) {
    const _effect = new ReactivityEffect(fn, options);
    // extend(_effect, options);
    _effect.run();
    //返回runner
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

//这里三条是优化
//提前创建好函数 再使用的时候无需重复创建
const get = createGetter();
const set = createSetter();
const readlonyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadlony = false, isShallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.iS_REACTIVE */) {
            return !isReadlony;
        }
        if (key === "__v_isReadlony" /* ReactiveFlags.iS_READLONY */) {
            return isReadlony;
        }
        const res = Reflect.get(target, key);
        //浅层
        if (isShallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadlony ? readlony(res) : reactivity(res);
        }
        if (!isReadlony) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readlonyGet,
    set: function (target, key, value) {
        console.warn('不可以set呢');
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function createActiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} 必须是一个对象`);
        return;
    }
    return new Proxy(raw, baseHandlers);
}
function reactivity(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readlony(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadlony(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}

// ref 原理和 reactive 一样
// 但是如果做 proxy 怎么知道什么时候get set？ 解决： 使用{}包裹
class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        // 如果value是对象 就用reactive包裹
        this.dep = new Set();
    }
    get value() {
        tractRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactivity(value) : value;
}
function tractRefValue(ref) {
    if (isTracking()) {
        tractEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!(ref && ref.__v_isRef);
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRef) {
    return new Proxy(objectWithRef, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return Reflect.set(target[key], 'value', value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: (event) => { },
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        component: null,
        next: null, //下次要更新的虚拟节点
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    //TODO
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStateFulComponent(instance);
}
function setupStateFulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInsatnceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        // function object
        const setupResult = setup(shallowReadlony(instance.props), {
            emit: instance.emit,
        });
        // setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    //TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}
let currentInstance;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvide = currentInstance.parent.provides;
        if (provides === parentProvide) {
            provides = currentInstance.provides = Object.create(parentProvide);
        }
        provides[key] = value;
    }
    console.log(currentInstance, 'cur');
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides)
            return parentProvides[key];
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppApi(render) {
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

function shouleUpdateComponent(n1, n2) {
    const { props: prevProps } = n1;
    const { props: nextProps } = n2;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

const queue = [];
let isFlushPending = false;
function nextTick(fn) {
    return fn ? Promise.resolve().then(fn) : Promise.resolve();
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    if (isFlushPending) {
        return;
    }
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while ((job = queue.shift())) {
        job && job();
    }
}

function createRender(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
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
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
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
        }
        else {
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
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
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
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            //老节点是个数组
            if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                unmountChildren(n1.children);
            }
            if (n1.children !== n2.chidren) {
                hostSetElementText(container, n2.children);
            }
        }
        else {
            //新的是文本 老的是数组
            if (prevShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                hostSetElementText(container, '');
                mountChildren(n2.children, container, parentComponent, anchor);
            }
            else {
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
            }
            else {
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
            }
            else {
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
        }
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
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
                }
                else {
                    for (let j = s2; j < e2; j++) {
                        if (isSomeVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
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
                }
                else {
                    if (i !== increasingNewIndexSequence[j]) {
                        console.log('移动位置');
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
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
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouleUpdateComponent(n1, n2)) {
            // instance.update();
            instance.next = n2;
            instance.update();
        }
        else {
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
        instance.update = effect(() => {
            console.log('n');
            if (!instance.isMounted) {
                const subTree = (instance.subTree = instance.render.call(instance.proxy));
                //vnode
                patch(null, subTree, container, instance, anchor);
                //这里 element => mount
                initalVNode.el = subTree.el;
                console.log(instance, 'initalVNode');
                instance.isMounted = true;
            }
            else {
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const subTree = instance.render.call(instance.proxy);
                const prevSubTree = instance.subTree;
                //这里对比
                // instance.subTree = subTree;/
                instance.subTree = subTree;
                console.log(prevSubTree, 'prevSubTree');
                console.log(subTree, 'subTree');
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        }, {
            scheduler() {
                console.log('update scr');
                queueJobs(instance.update);
            },
        });
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
function getSequence(arr) {
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
                }
                else {
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

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, preValue, nextValue) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event, nextValue);
    }
    else {
        if (nextValue === undefined || nextValue === null) {
            el.removeAttribute(key, nextValue);
        }
        else {
            el.setAttribute(key, nextValue);
        }
    }
}
function insert(child, parent, anchor) {
    // parent.append(el);
    parent.insertBefore(child, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRender({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createElement, createRender, createTextVNode, effect, getCurrentInstance, h, inject, insert, nextTick, patchProp, provide, proxyRefs, ref, remove, renderSlots, setElementText };
