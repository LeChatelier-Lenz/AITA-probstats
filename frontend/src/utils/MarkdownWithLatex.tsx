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

const MarkdownWithLatex: React.FC<MarkdownWithLatexProps> = ({ markdownContent }) => {
    const html = md.render(markdownContent);
  return (
      <div
        dangerouslySetInnerHTML={{ __html: html }}
      />
  );
};

export default MarkdownWithLatex;
