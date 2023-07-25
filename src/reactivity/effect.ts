//全局变量 保存当前正在调用的effect
let activeEffect;

class ReactivityEffect {
  private _fn: any;
  constructor(fn, public scheduler) {
    this._fn = fn;
    //保存调度器函数 如果有的话 在trigger触发时会执行这个
    this.scheduler = scheduler;
  }
  run() {
    activeEffect = this;
    //调用runner 返回值
    return this._fn();
  }
}

/**
 * 这里进行依赖收集
 * 收集起来的依赖 使用 Map 来存储
 * 结构为 Map({ target: Map({ key: set() })})
 */
const targetMap = new Map();
export function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

/** 当属性set时进行触发更新 将收集好的依赖全都在执行一遍 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactivityEffect(fn, options.scheduler);
  _effect.run();
  //返回runner
  return _effect.run.bind(_effect);
}
