import { effect } from '../effect';
import { reactivity, isReactive, isProxy } from '../reactivity';

describe('reactivity', () => {
  it('happy path', () => {
    const original = { foo: 1 };
    const observed = reactivity(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
  });

  it('nested reactive', () => {
    const origial = reactivity({
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    });
    expect(isReactive(origial)).toBe(true);
    expect(isReactive(origial.nested)).toBe(true);
    expect(isReactive(origial.array[0])).toBe(true);
  });

  it('isProxy', () => {
    const user = reactivity({ name: '小明' });
    expect(isProxy(user)).toBe(true);
  });

  it('aaa', () => {
    const user = reactivity({
      name: 'a',
    });
  });
});
