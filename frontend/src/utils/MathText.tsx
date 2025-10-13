import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

type MathTextProps = {
  text: string;
};

/**
 * 支持：
 * - 行内公式 \( … \)
 * - 块级公式 \[ … \]
 */
export const MathText: React.FC<MathTextProps> = ({ text }) => {
  // 正则匹配块公式和行内公式
  const regex = /(\\\[.*?\\\])|(\\\(.*?\\\))/gs;

  // 拆分文本和公式
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const formula = match[0];
    const displayMode = formula.startsWith("\\[");
    // 去掉包裹符
    const content = formula.slice(displayMode ? 2 : 2, formula.length - 2);

    // 渲染公式
    const html = katex.renderToString(content, { throwOnError: false, displayMode });
    parts.push(<span key={lastIndex} dangerouslySetInnerHTML={{ __html: html }} />);

    lastIndex = match.index + formula.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <div>{parts}</div>;
};
