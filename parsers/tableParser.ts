import Token from '../token';

/**
 * 解析 Markdown 表格语法
 * @param input Markdown 表格字符串
 * @returns 生成的 Token 序列
 */
export function parseTable(input: string): Token[] {
  const tokens: Token[] = [];
  const lines = input.trim().split('\n');

  // 表格至少需要标题行和分隔行
  if (lines.length < 2) {
    return tokens;
  }

  // 解析标题行
  const headerLine = lines[0];
  const headerCells = headerLine
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell); // 过滤空单元格

  // 解析分隔行（用于对齐方式）
  const separatorLine = lines[1];
  const separatorCells = separatorLine
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell);

  // 检查分隔行是否与标题行匹配
  if (separatorCells.length !== headerCells.length) {
    return tokens; // 不匹配则返回空
  }

  // 生成表格开标签
  tokens.push(new Token({ type: 'table_open', tag: '<table>', nesting: 1 }));

  // 生成表头
  tokens.push(new Token({ type: 'thead_open', tag: '<thead>', nesting: 1 }));
  tokens.push(new Token({ type: 'tr_open', tag: '<tr>', nesting: 1 }));

  headerCells.forEach((cell) => {
    tokens.push(new Token({ type: 'th_open', tag: '<th>', nesting: 1 }));
    tokens.push(new Token({ type: 'text', tag: '', nesting: 0, text: cell }));
    tokens.push(new Token({ type: 'th_close', tag: '</th>', nesting: -1 }));
  });

  tokens.push(new Token({ type: 'tr_close', tag: '</tr>', nesting: -1 }));
  tokens.push(new Token({ type: 'thead_close', tag: '</thead>', nesting: -1 }));

  // 生成表体
  tokens.push(new Token({ type: 'tbody_open', tag: '<tbody>', nesting: 1 }));

  // 解析数据行
  for (let i = 2; i < lines.length; i++) {
    const rowLine = lines[i];
    const rowCells = rowLine
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell);

    // 忽略不完整的行
    if (rowCells.length !== headerCells.length) {
      continue;
    }

    // 生成行开标签
    tokens.push(new Token({ type: 'tr_open', tag: '<tr>', nesting: 1 }));

    // 生成单元格
    rowCells.forEach((cell) => {
      tokens.push(new Token({ type: 'td_open', tag: '<td>', nesting: 1 }));
      tokens.push(new Token({ type: 'text', tag: '', nesting: 0, text: cell }));
      tokens.push(new Token({ type: 'td_close', tag: '</td>', nesting: -1 }));
    });

    // 生成行闭标签
    tokens.push(new Token({ type: 'tr_close', tag: '</tr>', nesting: -1 }));
  }

  // 生成表体闭标签
  tokens.push(new Token({ type: 'tbody_close', tag: '</tbody>', nesting: -1 }));

  // 生成表格闭标签
  tokens.push(new Token({ type: 'table_close', tag: '</table>', nesting: -1 }));

  return tokens;
}
