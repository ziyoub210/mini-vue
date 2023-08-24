import { baseParse } from '../src/parse';
import { NodeTypes } from '../src/ast';

describe('parse', () => {
  describe('interpolation', () => {
    test('simple interpolation', () => {
      const ast = baseParse('{{ message }}');
      console.log(ast.children[0], 'ast.children[0]ast.children[0]ast.children[0]');
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'message',
        },
      });
    });
  });
});
