import { track, trigger } from './effect';

function createGetter(isReadonly: Boolean = false) {
  return function get(target: any, key: any) {
    const res = Reflect.get(target, key);
    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}
function createSetter(isReadonly: Boolean = false) {
  return function set(target: any, key: any, value: any) {
    const res = Reflect.set(target, key, value);
    //TODO 触发依赖
    if (!isReadonly) {
      trigger(target, key);
    }
    return res;
  };
}

const get = createGetter();
const set = createSetter();

const readonlyGet = createGetter(true);
export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target: any, key: any, value: any) {
    console.warn(`key:${key} set 失败，因为 target 是 readonly`);
    return true;
  },
};
