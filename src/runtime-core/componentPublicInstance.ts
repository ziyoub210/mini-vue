const publicProertiesMap = {
  $el: (i) => i.vnode.el,
};

export const PublicInsatnceProxyHandlers = {
  get({ _: instance }, key) {
    if (key in instance.setupState) {
      return Reflect.get(instance.setupState, key);
    }
    const publicGetter = publicProertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
