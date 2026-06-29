import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ConvertStyle } from '../types';
import './ConvertedContent.css';

interface Props {
  text: string;
  style: ConvertStyle;
}

// 카드뉴스: ## 섹션별로 분리해서 카드로 렌더링
function CardNewsView({ text }: { text: string }) {
  // # 제목과 ## 섹션 파싱
  const lines = text.split('\n');
  const title = lines.find(l => l.startsWith('# '))?.replace(/^# /, '') ?? '';

  const sections: { heading: string; lines: string[] }[] = [];
  let current: { heading: string; lines: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith('# ')) continue; // 최상위 제목은 이미 추출
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { heading: line.replace(/^## /, ''), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);

  return (
    <div className="card-news-view">
      {title && <div className="card-news-title">{title}</div>}
      <div className="card-news-grid">
        {sections.map((sec, i) => (
          <div key={i} className="card-news-card">
            <div className="card-news-card-heading">{sec.heading}</div>
            <div className="card-news-card-body">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p>{children}</p>,
                  li: ({ children }) => <li>{children}</li>,
                  ul: ({ children }) => <ul>{children}</ul>,
                  strong: ({ children }) => <strong>{children}</strong>,
                }}
              >
                {sec.lines.join('\n')}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 소설/동화: 마크다운 그대로 prose 렌더링
function ProseView({ text, style }: { text: string; style: ConvertStyle }) {
  return (
    <div className={`prose-view prose-${style}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="prose-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="prose-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="prose-h3">{children}</h3>,
          p: ({ children }) => <p className="prose-p">{children}</p>,
          strong: ({ children }) => <strong>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          li: ({ children }) => <li>{children}</li>,
          ul: ({ children }) => <ul className="prose-ul">{children}</ul>,
          ol: ({ children }) => <ol className="prose-ol">{children}</ol>,
          blockquote: ({ children }) => <blockquote className="prose-blockquote">{children}</blockquote>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default function ConvertedContent({ text, style }: Props) {
  if (style === 'card') return <CardNewsView text={text} />;
  return <ProseView text={text} style={style} />;
}
