import { NodeTypes } from './ast';
enum TagType {
  START,
  END,
}
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

  let node;
  const s = context.source;
  if (s.startsWith('{{')) {
    node = parseInterpolation(context);
  } else if (s[0] === '<') {
    if (/[a-z]/.test(s[1])) {
      node = parseElement(context);
    }
  }
  if (!node) {
    node = parseText(context);
  }
  nodes.push(node);

  return nodes;
}

function parseText(context) {
  //1. 获取content
  const content = parseTextData(context, context.source.length);

  //2. 推进
  advanceBy(context, content.length);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}
function parseTextData(context, length) {
  return context.source.slice(0, length);
}

function parseElement(context) {
  const element = parseTag(context, TagType.START);
  parseTag(context, TagType.END);
  return element;
}

function parseTag(context, type: TagType) {
  //解析 tag
  //删除处理完成的代码
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  if (type === TagType.START) {
    return {
      type: NodeTypes.ELEMENT,
      tag,
    };
  }
}

function parseInterpolation(context: any) {
  const openDelemiter = '{{';
  const closeDelemiter = '}}';
  const closeIndex = context.source.indexOf('}}', closeDelemiter.length);

  advanceBy(context, openDelemiter.length);

  const rawContentLength = closeIndex - openDelemiter.length;

  // const rawContent = context.source.slice(0, rawContentLength);
  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim();

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
