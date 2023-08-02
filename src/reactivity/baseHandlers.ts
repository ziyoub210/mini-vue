import { track, trigger } from './effect';

import { ReactiveFlags } from './reactivity';
//这里三条是优化
//提前创建好函数 再使用的时候无需重复创建

const get = createGetter();
const set = createSetter();
const readlonyGet = createGetter(true);

function createGetter(isReadlony = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.iS_REACTIVE) {
      return !isReadlony;
    }
    if (key === ReactiveFlags.iS_READLONY) {
      return isReadlony;
    }

    const res = Reflect.get(target, key);
    if (!isReadlony) {
      track(target, key);
    }
    return res;
  };
}
function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readlonyGet,
  set: function (target, key, value) {
    console.warn('不可以set呢');

    return true;
  },
};
