import { createVNode } from '../createVNode';
import { Fragment } from '../createVNode';
export function renderSlots(slots, name, props) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot === 'function') {
      return createVNode(Fragment, {}, slot(props));
    }
  }
}
