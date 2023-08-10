import { PublicInsatnceProxyHandlers } from './componentPublicInstance';
import { initProps } from './componentProps';
import { shallowReadlony } from '../reactivity/reactivity';
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
  };
  return component;
}
export function setupComponent(instance) {
  //TODO
  initProps(instance, instance.vnode.props);
  // initSlots()
  setupStateFulComponent(instance);
}

function setupStateFulComponent(instance) {
  const Component = instance.type;

  instance.proxy = new Proxy({ _: instance }, PublicInsatnceProxyHandlers);

  const { setup } = Component;
  if (setup) {
    // function object
    const setupResult = setup(shallowReadlony(instance.props));

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
  console.log(Component, 'Component');
  instance.render = Component.render;
}
