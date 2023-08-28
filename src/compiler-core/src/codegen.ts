export function generate(ast: any) {
  const context: any = createCodegenContext();
  console.log(context, 'context');
  const { push } = context;
  push('return ');

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

function createCodegenContext() {
  const context = {
    code: '',
    push(source) {
      context.code += source;
    },
  };
  return context;
}
function genNode(node: any, context: any) {
  const { push } = context;
  // const node = ast.codegenNode;
  push(`'${node.content}'`);
}
