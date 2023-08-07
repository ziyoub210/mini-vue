export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
  };
  return component;
}
export function setupComponent(instance) {
  //TODO
  // initProps()
  // initSlots()
  setupStateFulComponent(instance);
}

function setupStateFulComponent(instance) {
  const Component = instance.type;

  const { setup } = Component;
  if (setup) {
    // function object
    const setupResult = setup();

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

  if (!Component.render) {
    instance.render = Component.render;
  }
}
