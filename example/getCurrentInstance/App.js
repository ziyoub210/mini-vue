import { h, createTextVNode, getCurrentInstance } from '../../lib/guide-mini-vue.esm.js';
import { Foo } from './foo.js';

export const App = {
  name: 'App',
  render() {
    return h('div', {}, [h('div', {}, 'enene '), h(Foo)]);
  },
  setup() {
    const instance = getCurrentInstance();
    console.log(instance, 'app中');
    return {
      msg: 'mini-vue-haha',
    };
  },
};
