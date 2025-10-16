// 从 Markdown 文本中提取简要纯文本片段
export function getPlainTextSnippet(markdown: string, length: number = 80): string {
  if (!markdown) return '';
  let text = markdown
    // 移除图片与链接
    // .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
    // .replace(/\[[^\]]*\]\([^\)]*\)/g, ' ')
    // 移除行内与块级 LaTeX
    // .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    // .replace(/\$[^$]+\$/g, ' ')
    // 移除代码块与行内代码
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    // 去掉常见 Markdown 标记字符
    // .replace(/[>#*_\-]+/g, ' ')
    // 合并空白与换行
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length > length) {
    text = text.slice(0, length) + '…';
  }
  return text;
}
