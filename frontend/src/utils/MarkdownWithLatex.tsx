import MarkdownIt from 'markdown-it';
import texmath from 'markdown-it-texmath';
// import itCopy from 'markdown-it-copy';
import hljs from 'highlight.js';
import 'katex/dist/katex.min.css'; // 导入KaTeX的样式
import 'highlight.js/styles/default.css'; // 导入highlight.js的样式
import katex from 'katex';
import './styles.css'; // 导入自定义样式

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str:string, lang:string) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }
    
        return ''; // 使用默认的代码块样式
      },
    }).use(texmath, { engine: katex, delimiters: 'dollars' })
    .use(texmath, { engine: katex, delimiters: 'brackets' });

interface MarkdownWithLatexProps {
  markdownContent: string; // 添加类型注解为字符串
}

// 去除可能的 ```markdown ... ``` 或 ``` ... ``` 围栏包裹
function stripFences(src: string): string {
  if (!src) return '';
  const s = src.trim();
  if (s.startsWith('```')) {
    const lines = s.split(/\r?\n/);
    // 第一行可能是 ``` 或 ```markdown
    if (lines[0].startsWith('```')) {
      // 找到最后一个仅包含 ``` 的行
      const lastFenceIdx = lines.lastIndexOf('```');
      if (lastFenceIdx > 0) {
        return lines.slice(1, lastFenceIdx).join('\n');
      }
    }
  }
  return src;
}

const MarkdownWithLatex: React.FC<MarkdownWithLatexProps> = ({ markdownContent }) => {
    const normalized = stripFences(markdownContent);
    const html = md.render(normalized);
  return (
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
  );
};

export default MarkdownWithLatex;
