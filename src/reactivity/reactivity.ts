import { mutableHandlers, readonlyHandlers } from './baseHandlers';

function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

export function reactivity(raw) {
  return createActiveObject(raw, mutableHandlers);
}

export function readlony(raw) {
  return createActiveObject(raw, readonlyHandlers);
}
