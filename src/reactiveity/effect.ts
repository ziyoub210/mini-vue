import { extend } from '../shared';
type Fn = (...args: any) => any;
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
    activeEffect = this;
    return this._fn();
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
  if (activeEffect) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

export function trigger(target: any, key: any) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
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

let activeEffect: ReactiveEffect;
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
