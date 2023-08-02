import { isReactive, isReadlony, readlony } from '../reactivity';

describe('readlony', () => {
  it('readlony', () => {
    const original = { foo: 1, bar: { bar: 2 } };
    const wrapped = readlony(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  });


  it('readlony no set', () => {
    console.warn = jest.fn();
    const user = readlony({ name: '1' });
    user.name = 10;
    //触发set的应该有警告
    expect(console.warn).toBeCalled();
  });

  it('is readlony', () => {
    const user = readlony({name: '1'})
    expect(isReadlony(user)).toBe(true)
    expect(isReactive(user)).toBe(false)
  })
});
