import { isReadlony, shallowReadlony } from '../reactivity';

describe('shallowReadlony', () => {
  test('it shallowReadlony', () => {
    const props = shallowReadlony({ n: { foo: 1 } });
    expect(isReadlony(props)).toBe(true)
    expect(isReadlony(props.n)).toBe(false)
  });
});
