import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js';

//explame props
export const Foo = {
  setup() {},
  render() {
    const foo = h('p', {}, 'foo');
    const age = 18;
    // return h('div', {}, [foo, h('div', {}, this.$slots)]);
    return h('div', {}, [
      renderSlots(this.$slots, 'header', {
        age,
      }),
      foo,
      renderSlots(this.$slots, 'footer'),
    ]);
  },
};
