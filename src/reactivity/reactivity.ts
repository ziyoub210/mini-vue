import { track, trigger } from './effect';

export function reactivity(raw) {
  return new Proxy(raw, {
    get(target, key) {
      //TODO 依赖收集
      track(target, key);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      //TODO 派发更新
      trigger(target, key);
      Reflect.set(target, key, value);
      return true;
    },
  });
}
