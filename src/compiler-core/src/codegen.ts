import { NodeTypes } from './ast';
import { TO_DISPLAY_STRING, helperMapName } from './runtimeHelplers';

export function generate(ast: any) {
  const context: any = createCodegenContext();
  const { push } = context;
  //生成前面导入的代码
  genFunctionPreamble(ast, context);

  const functionName = 'render';
  const args = ['_ctx', '_cache'];

  const signature = args.join(', ');

  push(`function ${functionName}(${signature}) {`);

  push('return ');
  genNode(ast.codegenNode, context);
  push('}');

  return {
    code: context.code,
  };
}

function genFunctionPreamble(ast, context: any) {
  const { push } = context;
  const VueBinging = 'Vue';
  // const helpers = ['toDisplayString'];
  const aliasHelpers = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;

  if (ast.helpers.length > 0) {
    push(`const { ${ast.helpers.map((help) => aliasHelpers(help))} } = ${VueBinging}`);
    push('\n');
  }

  push('return ');
}

function createCodegenContext() {
  const context = {
    code: '',
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  };
  return context;
}
function genNode(node: any, context: any) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
  }
}

function genExpression(node, context) {
  const { push } = context;
  push(`${node.content}`);
}

function genText(node, context) {
  const { push } = context;
  push(`'${node.content}'`);
}

function genInterpolation(node, context) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(`)`);
}
