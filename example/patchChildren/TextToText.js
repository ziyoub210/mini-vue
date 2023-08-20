import { h, ref } from '../../lib/guide-mini-vue.esm.js';

const prevChild = 'oldText';
const nextChild = 'newText';

export default {
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;
    return {
      isChange,
    };
  },
  render() {
    const self = this;
    return self.isChange ? h('div', {}, nextChild) : h('div', {}, prevChild);
  },
};
