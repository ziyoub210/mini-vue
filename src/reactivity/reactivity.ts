import { mutableHandlers, readonlyHandlers } from './baseHandlers';

export const enum ReactiveFlags {
  iS_REACTIVE = '__v_isReactive',
  iS_READLONY = '__v_isReadlony',
}

function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

export function reactivity(raw) {
  return createActiveObject(raw, mutableHandlers);
}

export function readlony(raw) {
  return createActiveObject(raw, readonlyHandlers);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.iS_REACTIVE];
}

export function isReadlony(value) {
  return !!value[ReactiveFlags.iS_READLONY];
}
