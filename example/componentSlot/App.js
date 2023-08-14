import { h, createTextVNode } from '../../lib/guide-mini-vue.esm.js';
import { Foo } from './foo.js';

export const App = {
  name: 'App',
  render() {
    const app = h('div', {}, 'app');
    // const foo = h(Foo, {}, [h('p', {}, 'hello'), h('p', {}, '456')]);
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => [h('p', {}, 'header' + age), createTextVNode('你好呀')],
        footer: () => h('p', {}, 'footer'),
      }
    );
    return h('div', {}, [app, foo]);
  },
  setup() {
    return {
      msg: 'mini-vue-haha',
    };
  },
};
