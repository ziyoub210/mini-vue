import { extend } from '../shared';
type Fn = (...args: any) => any;
let activeEffect: ReactiveEffect;
let shouldTrack: boolean;

class ReactiveEffect {
  private _fn: Fn;
  public scheduler: any;
  public deps: any = [];
  private active = true;
  public onStop?: () => any;
  constructor(_fn: Fn) {
    this._fn = _fn;
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
      if (this.onStop) this.onStop();
      this.active = false;
    }
  }
}
function cleanupEffect(effect: any) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
}
// 结构为 map: { map: set}
const targetMap = new Map();
export function track(target: any, key: any) {
  if (!isTracking()) return;
  // target -> key -> dep
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
  trackEffects(dep);
}
export function trackEffects(dep: any) {
  if (isTracking()) {
    if (dep.has(activeEffect)) return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target: any, key: any) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  triggerEffects(dep);
}
export function triggerEffects(dep: any) {
  if (dep) {
    for (const effect of dep) {
      if (effect.scheduler) {
        effect.scheduler();
      } else {
        effect.run();
      }
    }
  }
}
export function effect(fn: any, options: any = {}) {
  const _effect = new ReactiveEffect(fn);
  extend(_effect, options);

  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export function stop(runner: any) {
  runner.effect.stop();
}
