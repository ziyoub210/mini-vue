const publicProertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
  $props: (i) => i.props,
};

export const PublicInsatnceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance;
    // if (key in instance.setupState) {
    //   return Reflect.get(instance.setupState, key);
    // }

    const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    const publicGetter = publicProertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
