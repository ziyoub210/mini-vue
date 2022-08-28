import { reactivity } from '../reactivity';
import { effect, stop } from '../effect';
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
    user.age++;
    expect(nextAge).toBe(12);
  });
  it('effect runner', () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return 'foo';
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe('foo');
  });
  it('effect scheduler', () => {
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
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  });
  //run => get => set(执行所有的run) => get => set(执行所有的run)  => get
  it('stop', () => {
    let dummy;
    const obj = reactivity({ foo: 1 });
    const runner = effect(() => {
      dummy = obj.foo; //依赖收集 把effect收集进去了，然后后obj.foo set的时候就会触发这个effect
    });
    obj.foo = 2; //set 会调用上面那个effect
    expect(dummy).toBe(2);
    stop(runner);
    obj.foo++; //obj.foo = obj.foo + 1
    expect(dummy).toBe(2);
    runner();
    expect(dummy).toBe(3);
    obj.foo = 5;
    expect(dummy).toBe(3);
  });
  it('onStop', () => {
    const obj = reactivity({ foo: 1 });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
