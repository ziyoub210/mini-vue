import { ReactivityEffect } from './effect';
class ComputedRefImpl {
  private _getter: any;
  private _value: any;
  private _dirty: boolean = true;
  private _effect: any;
  constructor(getter) {
    this._getter = getter;
    this._effect = new ReactivityEffect(this._getter, {
      scheduler: () => {
        this._dirty = true;
      },
    });
  }

  get value() {
    if (this._dirty) {
      this._dirty = false;
      //   this._value = this._getter();
      this._value = this._effect.run();
    }
    return this._value;
  }
}
export function computed(getter) {
  return new ComputedRefImpl(getter);
}
