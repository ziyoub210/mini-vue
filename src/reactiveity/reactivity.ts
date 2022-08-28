import { mutableHandlers, readonlyHandlers } from './baseHandlers';

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

export function createReactiveObject(raw: any, baseHandlers: any) {
  return new Proxy(raw, baseHandlers);
}

export function reactivity(raw: any): any {
  return createReactiveObject(raw, mutableHandlers);
}
export function readonly(raw: any) {
  return createReactiveObject(raw, readonlyHandlers);
}

export function isReactive(value: any) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}
export function isReadonly(value: any) {
  return !!value[ReactiveFlags.IS_READONLY];
}
