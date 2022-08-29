import { reactivity, isReactive, isProxy } from '../reactivity';
import { effect } from '../effect';
describe('reactivity', () => {
  it('happy path', () => {
    const original = { foo: 1 };
    const observed = reactivity(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
    expect(isProxy(observed)).toBe(true);
    expect(isProxy(original)).toBe(false);
  });
  it('nasted reactive', () => {
    const original = {
      nasted: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactivity(original);
    let a;
    effect(() => {
      a = observed.nasted.foo;
    });
    expect(isReactive(observed.nasted)).toBe(true);
    expect(isReactive(observed.nasted)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
    expect(a).toBe(1);
    observed.nasted.foo++;
    expect(a).toBe(2);
  });
});
