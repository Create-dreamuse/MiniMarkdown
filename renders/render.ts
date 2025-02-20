import Token from '../token'

export function render(tokens: Token[]) {
  let html = '';
  tokens.forEach((token) => {
    if (token.tag) html += token.tag; // 直接拼接标签
    if (token.type === 'text' && token.text) {
      html += token.text; // 补充文本内容
    }
  });
  return html;
}
