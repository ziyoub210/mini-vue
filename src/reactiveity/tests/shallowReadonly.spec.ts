import { shallowReadonly, isReadonly } from '../reactivity';
describe('shallowReadonly', () => {
  test('should not make non-reactive properties reactive', () => {
    const props: any = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });
});
