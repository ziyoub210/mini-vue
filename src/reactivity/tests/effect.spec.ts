import { reactivity } from '../reactivity';
import { effect } from '../effect';

describe('effect', () => {
  it('happy path', () => {
    const user = reactivity({
      age: 10,
    });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);

    //update
    // user.age++;
    // expect(nextAge).toBe(12);
  });

  it('runner', () => {
    let age = 10;
    const runner = effect(() => {
      age++;
      return 'foo';
    });
    //effect 调用
    expect(age).toBe(11);
    const r = runner();
    expect(r).toBe('foo');
    expect(age).toBe(12);
  });

  it('scheduler', () => {
    //scheduler 描述
    //

    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactivity({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        scheduler,
      }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    obj.foo++;
    expect(scheduler).toBeCalledTimes(1);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  });
});
