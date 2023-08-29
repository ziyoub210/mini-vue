import { NodeTypes } from './ast';
enum TagType {
  START,
  END,
}
export function baseParse(content: string) {
  const context = createParseContext(content);
  const root = createRoot(parseChildren(context, []));
  console.log(root, 'root');
  return root;
}

function createRoot(children) {
  return {
    children,
    type: NodeTypes.ROOT,
  };
}

function parseChildren(context, ancestors) {
  const nodes: any = [];
  while (!isEnd(context, ancestors)) {
    let node;
    const s = context.source;
    if (s.startsWith('{{')) {
      node = parseInterpolation(context);
    } else if (s[0] === '<') {
      if (/[a-z]/.test(s[1])) {
        node = parseElement(context, ancestors);
      }
    }
    if (!node) {
      node = parseText(context);
    }
    nodes.push(node);
  }

  return nodes;
}

function isEnd(context, ancestors: any) {
  const s: string = context.source;
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if (startwWithEndTagOpen(s, tag)) {
        return true;
      }
    }
  }
  return !s;
}

function parseText(context) {
  let endTokens = ['{{', '<'];
  let endIndex = context.source.length;
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i]);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }

  const content = parseTextData(context, endIndex);
  console.log(content, 'context,-----------');
  return {
    type: NodeTypes.TEXT,
    content,
  };
}
function parseTextData(context, length) {
  const content = context.source.slice(0, length);
  advanceBy(context, length);
  return content;
}

function parseElement(context, ancestors) {
  const element: any = parseTag(context, TagType.START);
  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();

  // if (context.source.slice(2, 2 + element.tag.length) === element.tag) {
  if (startwWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.END);
  } else {
    throw new Error(`缺少结束标签： ${element.tag}`);
  }

  return element;
}

function startwWithEndTagOpen(source, tag) {
  return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag;
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

  advanceBy(context, closeDelemiter.length);

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
