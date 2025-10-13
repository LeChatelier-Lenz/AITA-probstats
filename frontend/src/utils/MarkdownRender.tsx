import React from 'react';
import MarkdownIt from 'markdown-it';

const MarkdownRenderer = ({ markdown }) => {
  const md = new MarkdownIt();
  const renderedMarkdown = md.render(markdown);

  return <div dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />;
};

export default MarkdownRenderer;