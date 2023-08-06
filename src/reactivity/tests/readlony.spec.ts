import { isReactive, isReadlony, readlony, isProxy } from '../reactivity';

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
    const user = readlony({ name: '1' });
    expect(isReadlony(user)).toBe(true);
    expect(isReactive(user)).toBe(false);
  });

  it('nested readlony', () => {
    const origial = readlony({
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    });
    expect(isReadlony(origial)).toBe(true);
    expect(isReadlony(origial.nested)).toBe(true);
    expect(isReadlony(origial.array[0])).toBe(true);
  });
  it('isProxy', () => {
    const user = readlony({ name: '小明' });
    expect(isProxy(user)).toBe(true);
  });
});
