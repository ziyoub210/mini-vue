import { baseParse } from '../src/parse';
import { transform } from '../src/transform';
import { NodeTypes } from '../src/ast';

describe('transform', () => {
  it('happy path', () => {
    const ast = baseParse('<div>hi,{{message}}</div>');
    const plugin = (node) => {
      if (node.type === NodeTypes.TEXT) {
        node.content = node.content + 'mini-vue';
      }
    };
    transform(ast, {
      nodeTransforms: [plugin],
    });

    const nodeType = ast.children[0].children[0];

    expect(nodeType.content).toBe('hi,mini-vue');
  });
});
