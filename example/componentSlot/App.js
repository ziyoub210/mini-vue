import { h } from '../../lib/guide-mini-vue.esm.js';
import { Foo } from './foo.js';

export const App = {
  name: 'App',
  render() {
    const app = h('div', {}, 'app');
    const foo = h(foo);
    return h('div', {}, [app, foo]);
  },
  setup() {
    return {
      msg: 'mini-vue-haha',
    };
  },
};
