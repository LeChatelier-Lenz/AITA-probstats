import MarkdownIt from 'markdown-it';

const MarkdownRenderer = ({ markdown }: { markdown: string }) => {
  const md = new MarkdownIt();
  const renderedMarkdown = md.render(markdown);

  return <div dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />;
};

export default MarkdownRenderer;