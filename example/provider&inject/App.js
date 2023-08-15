import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js';

const Provide = {
  name: 'Provide',
  setup() {
    provide('foo', 'fooVal');
    provide('bar', 'barVal');
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provide'), h(ProvideTwo)]);
  },
};

const ProvideTwo = {
  name: 'ProvideTwo',
  setup() {
    provide('foo', 'fooTWO');
    const foo = inject('foo');
    return {
      foo,
    };
  },
  render() {
    return h('div', {}, [h('div', {}, '我是provideTWO创建的div, 我拿到父级的foo--' + this.foo), h(Consumer)]);
  },
};

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo');
    const bar = inject('bar');
    const baz = inject('baz', 'baz');
    const bazFun = inject('bazFun', () => 'bazFun');
    return {
      foo,
      bar,
      baz,
      bazFun,
    };
  },
  render() {
    return h('div', {}, [
      h('p', {}, '我是provide拿到的 我再consumer里foo---' + this.foo),
      h('p', {}, '我是provide拿到的 我再consumer里bar---' + this.bar),
      h('p', {}, '我是provide拿到的 baz---' + this.baz),
      h('p', {}, '我是provide拿到的 bazFun---' + this.bazFun),
    ]);
  },
};

const A = {
  name: 'A',
  setup() {},
  render() {
    return h(Provide);
  },
};

export const App = {
  name: 'App',
  setup() {},
  render() {
    return h(A);
  },
};
