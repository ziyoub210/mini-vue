import { trackEffects, triggerEffects } from './effect';
import { hasChanged } from '../shared';
import { isObject } from '../shared/index';
import { reactivity } from './reactivity';
class RefImpl {
  private _value;
  public dep;
  private _rawValue;
  public __v_isRef = true;
  constructor(value: any) {
    this._rawValue = value;
    this._value = convert(value);
    //obj value => reactive
    //1 value是对象吗
    this.dep = new Set();
  }
  get value() {
    trackEffects(this.dep);

    return this._value;
  }
  set value(value) {
    //hasChanged
    if (hasChanged(value, this._rawValue)) return;
    this._rawValue = value;
    this._value = convert(value);
    triggerEffects(this.dep);
  }
}
function convert(value: any) {
  return isObject(value) ? reactivity(value) : value;
}
export function ref(value: any) {
  return new RefImpl(value);
}

export function isRef(ref: any) {
  return !!ref.__v_isRef;
}

export function unRef(ref: any) {
  return isRef(ref) ? ref.value : ref;
}
