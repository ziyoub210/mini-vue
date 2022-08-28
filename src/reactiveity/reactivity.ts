import { mutableHandlers, readonlyHandlers } from './baseHandlers';

export function createReactiveObject(raw: any, baseHandlers: any) {
  return new Proxy(raw, baseHandlers);
}

export function reactivity(raw: any): any {
  return createReactiveObject(raw, mutableHandlers);
}
export function readonly(raw: any) {
  return createReactiveObject(raw, readonlyHandlers);
}
