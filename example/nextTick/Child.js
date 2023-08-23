import { h } from '../../lib/guide-mini-vue.esm.js';
export const Child = {
  setup(props) {},
  render() {
    return h('div', {}, 'woshi child msg:' + this.$props.msg);
  },
};
