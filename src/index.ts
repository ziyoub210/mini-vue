// mini-vue 的出口
export * from './runtime-dom/index';

import * as runtimeDom from './runtime-dom/index';

import { baseComplie } from './compiler-core/src/complie';
import { registerRuntimeComplier } from './runtime-dom/index';

function complieToFunction(template) {
  const { code } = baseComplie(template);

  const render = new Function('Vue', code)(runtimeDom);

  return render;
}

registerRuntimeComplier(complieToFunction);
