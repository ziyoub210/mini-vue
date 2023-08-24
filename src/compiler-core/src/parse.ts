import { NodeTypes } from './ast';
export function baseParse(content: string) {
  const context = createParseContext(content);
  return createRoot(parseChildren(context));
}

function createRoot(children) {
  return {
    children,
  };
}

function parseChildren(context) {
  const nodes: any = [];
  if (context.source.startsWith('{{')) {
    const node = parseInterpolation(context);
    console.log(node, 'node');
    nodes.push(node);
  }

  return nodes;
}

function parseInterpolation(context: any) {
  const openDelemiter = '{{';
  const closeDelemiter = '}}';
  const closeIndex = context.source.indexOf('}}', closeDelemiter.length);

  advanceBy(context, openDelemiter.length);

  const rawContentLength = closeIndex - openDelemiter.length;

  const rawContent = context.source.slice(0, rawContentLength);
  const content = rawContent.trim();
  console.log(rawContent, 'source');
  advanceBy(context, rawContentLength + closeDelemiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}
function advanceBy(context, length) {
  context.source = context.source.slice(length);
}

function createParseContext(content: string) {
  return {
    source: content,
  };
}
