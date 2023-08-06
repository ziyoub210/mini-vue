import { tractEffects, triggerEffects, isTracking } from './effect';
import { hasChanged, isObject } from '../shared';
import { reactivity } from './reactivity';

// ref 原理和 reactive 一样
// 但是如果做 proxy 怎么知道什么时候get set？ 解决： 使用{}包裹

class RefImpl {
  private _value: any;
  private _rawValue: any;

  public dep;

  constructor(value) {
    this._rawValue = value;
    this._value = convert(value);
    // 如果value是对象 就用reactive包裹
    this.dep = new Set();
  }
  get value() {
    tractRefValue(this);

    return this._value;
  }
  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = convert(newValue);
      triggerEffects(this.dep);
    }
  }
}
function convert(value) {
  return isObject(value) ? reactivity(value) : value;
}

function tractRefValue(ref) {
  if (isTracking()) {
    tractEffects(ref.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}
