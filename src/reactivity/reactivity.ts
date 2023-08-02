import { track, trigger } from './effect';

export function reactivity(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key);
      track(target, key);
      return res;
    },
    
    set(target, key, value) {
      const res = Reflect.set(target, key, value);
      //TODO 派发更新
      trigger(target, key);

      return res;
    },
  });
}
