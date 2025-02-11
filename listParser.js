import Token from './token.js'
// listParser.js
export function createListParser() {
  let listStack = [] // 保存当前列表层级信息 { indent: number, type: 'ul'|'ol' }
  let pendingTokens = []

  function calculateIndent(line) {
    const indentStr = line.match(/^\s*/)[0]
    return indentStr.replace(/\t/g, '    ').length
  } //计算缩进

  function generateListTokens(type, action, level) {
    const tagMap = {
      open: { type: `${type}_open`, nesting: 1 },
      close: { type: `${type}_close`, nesting: -1 },
    }

    pendingTokens.push(
      new Token({
        ...tagMap[action],
        tag: action == 'open' ? `<${type}>` : `</${type}>`,
        level: level,
      }),
    )
  }

  function parseListItem(line) {
    const text = line.replace(/^\s*[\*\-+]|\d+\.\s*/, '').trim()
    const tokens = []

    tokens.push(
      new Token({ type: 'list_item_open', tag: '<li>', nesting: 1 }),
      new Token({ type: 'text', text: text, nesting: 0 }),
      new Token({ type: 'list_item_close', tag: '</li>', nesting: -1 }),
    )

    return tokens
  }

  return {
    parseLine(line) {
      const listMatch = line.match(/^(\s*)([\*\-+]|\d+\.)\s/)
      if (!listMatch) return null

      const indent = calculateIndent(line)
      const listType = /\d/.test(listMatch[2]) ? 'ol' : 'ul'
      const output = []

      // 处理列表层级关系
      while (listStack.length > 0) {
        const current = listStack[listStack.length - 1]

        if (indent > current.indent) {
          // 缩进增加
          generateListTokens(listType, 'open', listStack.length)
          listStack.push({ indent, type: listType })
          break
        } else if (indent === current.indent) {
          // 同级处理
          if (current.type !== listType) {
            // 切换列表类型
            generateListTokens(current.type, 'close', listStack.length - 1)
            listStack.pop()
            generateListTokens(listType, 'open', listStack.length)
            listStack.push({ indent, type: listType })
          }
          break
        } else {
          // 缩进减少
          generateListTokens(current.type, 'close', listStack.length - 1)
          listStack.pop()
        }
      }

      // 处理根列表
      if (listStack.length === 0) {
        generateListTokens(listType, 'open', 0)
        listStack.push({ indent, type: listType })
      }

      // 合并待处理token
      output.push(...pendingTokens)
      pendingTokens = []

      // 添加列表项
      output.push(...parseListItem(line))
      return output
    },

    flush() {
      const output = []
      while (listStack.length > 0) {
        const type = listStack.pop().type
        generateListTokens(type, 'close', listStack.length)
      }
      output.push(...pendingTokens)
      pendingTokens = []
      return output
    },
  }
}
