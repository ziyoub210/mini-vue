const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
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

const publicProertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
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
    console.log(event, 'event');
    const { props } = instance;
    //TDD
    //先去写一个特定的行为 =》 重构成通用的行为
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

/**
 * 这里进行依赖收集
 * 收集起来的依赖 使用 Map 来存储
 * 结构为 Map({ target: Map({ key: set(effect1, effect2) })})
 */
const targetMap = new Map();
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

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: (event) => { },
        slots: {},
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
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    //TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
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

function render(vnode, container) {
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
            if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                processElement(vnode, container);
            }
            else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
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
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    const { props } = vnode;
    for (const key in props) {
        const value = props[key];
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLocaleLowerCase();
            el.addEventListener(event, value);
        }
        else {
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

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转 vnode
            // component -> vnode
            // 后续所有的操作 都会基于vnode处理
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
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

export { createApp, createTextVNode, getCurrentInstance, h, renderSlots };
