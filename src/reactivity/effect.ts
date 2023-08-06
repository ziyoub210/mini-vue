import { extend } from '../shared/index';
//全局变量 保存当前正在调用的effect
let activeEffect;
let shouldTrack; //是否应该收集依赖
class ReactivityEffect {
  private _fn: any;
  active = true;
  deps = []; //反向收集的依赖
  scheduler?: () => void;
  onStop?: () => void;
  constructor(fn) {
    this._fn = fn;
    //保存调度器函数 如果有的话 在trigger触发时会执行这个
  }
  run() {
    if (!this.active) {
      return this._fn();
    }
    shouldTrack = true;

    activeEffect = this;
    const result = this._fn();
    shouldTrack = false;

    return result;
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
      this.onStop && this.onStop();
    }
  }
}

function cleanupEffect(effect: any) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}

/**
 * 这里进行依赖收集
 * 收集起来的依赖 使用 Map 来存储
 * 结构为 Map({ target: Map({ key: set(effect1, effect2) })})
 */
const targetMap = new Map();
export function track(target, key) {
  if (!isTracking()) return;
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
  if (!activeEffect) return;
  tractEffects(dep);
}

export function tractEffects(dep) {
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

/** 当属性set时进行触发更新 将收集好的依赖全都在执行一遍 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  triggerEffects(dep);
}

export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactivityEffect(fn);
  extend(_effect, options);
  _effect.run();
  //返回runner
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
