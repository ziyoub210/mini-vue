import { h } from '../../lib/guide-mini-vue.esm.js';
import { Foo } from './foo.js';

export const App = {
  render() {
    return h(
      'div',
      {
        id: 'root',
        class: ['blue'],
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
          onAdd(a, b) {
            console.log('on-add', '-----------', a, b);
          },
          onAddFoo(a, b) {
            console.log('add-foo111', a, b);
          },
        }),
      ]
    );
  },
  setup() {
    return {
      msg: 'mini-vue-haha',
    };
  },
};
