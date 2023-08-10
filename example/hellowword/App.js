import { h } from '../../lib/guide-mini-vue.esm.js';
import { Foo } from './foo.js';

export const App = {
  render() {
    return h(
      'div',
      {
        id: 'root',
        class: ['blue'],
        onClick() {
          console.log('click');
        },
        onMousedown() {
          console.log('mousedown');
        },
      },
      [
        h(
          'div',
          {
            class: 'red',
          },
          'hi' + this.msg
        ),
        h(Foo, {
          count: 1,
        }),
      ]

      // [
      //   // 'hi mini-vue'

      //   (h('p', { class: 'ppp' }, 'hi'), h('p', { class: 'ppp' }, 'mini-vue'))
      // ]
    );
  },
  setup() {
    return {
      msg: 'mini-vue-haha',
    };
  },
};
