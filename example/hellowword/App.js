import { h } from '../../lib/guide-mini-vue.esm.js';

window.self = null;
export const App = {
  render() {
    window.self = this;
    setTimeout(() => {
      console.log(window.self, 'window.self');
    });
    return h(
      'div',
      {
        id: 'root',
        class: ['blue'],
      },
      'hi' + this.msg
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
