import { h } from '../../lib/guide-mini-vue.esm.js';

//explame props
export const Foo = {
  setup() {},
  render() {
    const foo = h('p', {}, 'foo');
    return h('div', {}, [foo]);
  },
};
