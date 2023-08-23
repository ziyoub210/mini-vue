import { h, ref, getCurrentInstance, nextTick } from '../../lib/guide-mini-vue.esm.js';
export const App = {
  setup() {
    const count = ref(0);
    const changeCount = () => {
      for (let i = 0; i < 100; i++) {
        count.value = i;
      }
      const instance = getCurrentInstance();
      console.log(instance);
      nextTick(() => {
        const instance = getCurrentInstance();
        console.log(instance, 'instan');
      });
    };

    return {
      count,
      changeCount,
    };
  },
  render() {
    return h('div', {}, [
      h(
        'button',
        {
          onClick: this.changeCount,
        },
        'change self count'
      ),
      h('p', {}, 'count-' + this.count),
    ]);
  },
};
