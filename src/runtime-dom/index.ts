import { createRender } from '../runtime-core/index';

export function createElement(type) {
  return document.createElement(type);
}

export function patchProp(el, key, preValue, nextValue) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLocaleLowerCase();
    el.addEventListener(event, nextValue);
  } else {
    if (nextValue === undefined || nextValue === null) {
      el.removeAttribute(key, nextValue);
    } else {
      el.setAttribute(key, nextValue);
    }
  }
}

export function insert(el, parent) {
  parent.append(el);
}

const renderer: any = createRender({
  createElement,
  patchProp,
  insert,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from '../runtime-core/index';
