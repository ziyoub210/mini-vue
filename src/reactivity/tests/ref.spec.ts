import { effect } from '../effect';
import { reactivity } from '../reactivity';
import { ref, isRef, unRef } from '../ref';

describe('ref', () => {
  it('happy path', () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });
  it('should be reactive', () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    a.value = 2;
    //应该不会更新
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });

  it('should make nested properties reactive', () => {
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });

  it('isRef & unRef', () => {
    const a = ref('1');
    const user = reactivity({
      name: '小明',
    });
    expect(isRef(a)).toBe(true);
    expect(isRef(user)).toBe(false);
  });
  it('unRef', () => {
    const a = ref('1');
    expect(unRef(1)).toBe(1);
    expect(unRef(a)).toBe('1');
  });
});
