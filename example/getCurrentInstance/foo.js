import { h, renderSlots, getCurrentInstance } from '../../lib/guide-mini-vue.esm.js';

//explame props
export const Foo = {
  setup() {
    const instance = getCurrentInstance();
    console.log(instance, 'foo中');
  },
  render() {
    return h('div', { class: 'red' }, '你好啊-Foo');
  },
};
