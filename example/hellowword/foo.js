import { h } from '../../lib/guide-mini-vue.esm.js';

//explame props
export const Foo = {
  setup(props) {
    console.log(props);
    props.count++;
  },
  render() {
    return h('div', { name: '1' }, 'foo: ' + this.count);
  },
};
