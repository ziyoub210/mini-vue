import { computed } from './computed';
import { reactivity } from './reactivity';
import { ref } from './ref';
describe('computed', () => {
  it('happy path', () => {
    const user = reactivity({
      age: 1,
    });
    const age = computed(() => {
      return user.age;
    });
    expect(age.value).toBe(1);
  });

  it('should computed lazily', () => {
    const value = reactivity({
      foo: 1,
    });
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toBeCalledTimes(1);

    cValue.value;
    expect(getter).toBeCalledTimes(1);

    value.foo = 2;
    expect(getter).toBeCalledTimes(1);
    expect(cValue.value).toBe(2);

    const v = ref(0);
    const vCom = computed(() => v.value);
    v.value = 10;
    expect(vCom.value).toBe(10);
  });
});
