import { PublicInsatnceProxyHandlers } from './componentPublicInstance';
import { initProps } from './componentProps';
import { emit } from './componentEmit';

import { shallowReadlony } from '../reactivity/reactivity';
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: (event: any) => {},
  };
  component.emit = emit.bind(null, component) as any;
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
    const setupResult = setup(shallowReadlony(instance.props), {
      emit: instance.emit,
    });

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
