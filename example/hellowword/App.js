import { h } from '../../lib/guide-mini-vue.esm.js';

export const App = {
  render() {
    return h(
      'div',
      {
        id: 'root',
        class: ['blue'],
      },
      // 'hi' + this.msg
      // 'hi mini-vue'

      [h('p', { class: 'ppp' }, 'hi'), h('p', { class: 'ppp' }, 'mini-vue')]
    );
  },
  setup() {
    return {
      msg: 'mini-vue',
    };
  },
};
