import { ref, h } from '../../lib/guide-mini-vue.esm.js';

//左侧的对比
// const prevChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'), h('p', { key: 'C' }, 'C')];
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'E' }, 'E'),
// ];

//右侧的对比
const prevChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'), h('p', { key: 'C' }, 'C')];
const nextChildren = [
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
];

// 新的比老的长;
// const prevChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B')];
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
// ];

//老的比新的长
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
// ];

// const nextChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B')];

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
    return h('div', {}, self.isChange ? nextChildren : prevChildren);
  },
};
