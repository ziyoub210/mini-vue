import { h } from '../../lib/guide-mini-vue.esm.js';
import ArrayToText from './ArrayToText.js';
import TextToArray from './TextToArray.js';
import TextToText from './TextToText.js';
import ArrayToArray from './ArrayToArray.js';

export const App = {
  name: 'app',
  setup() {},
  render() {
    return h('div', { tId: 1 }, [h('p', {}, '主页'), h(ArrayToArray)]);
    // return h('div', { tId: 1 }, [h('p', {}, '主页'), h(TextToArray)]);
    // return h('div', { tId: 1 }, [h('p', {}, '主页'), h(ArrayToText)]);
    // return h('div', { tId: 1 }, [h('p', {}, '主页'), h(TextToText)]);
  },
};
