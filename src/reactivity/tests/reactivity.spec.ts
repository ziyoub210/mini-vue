import { reactivity, readlony } from '../reactivity';

describe('reactivity', () => {
  it('happy path', () => {
    const original = { foo: 1 };
    const observed = reactivity(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
  });

  it('readlony', () => {
    const original = { foo: 1, bar: { bar: 2 } };
    const wrapped = readlony(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  });

  it('readlony no set', () => {
    console.warn = jest.fn()
    const user = readlony({ name: '1' });
    user.name = 10;
    //触发set的应该有警告
    expect(console.warn).toBeCalled()
  });
});
