import { reactivity, isReactive } from '../reactivity';

describe('reactivity', () => {
  it('happy path', () => {
    const original = { foo: 1 };
    const observed = reactivity(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
    expect(isReactive(observed)).toBe(true);
  });
});
