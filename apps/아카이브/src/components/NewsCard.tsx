import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsItem } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

interface Props {
  news: NewsItem;
  featured?: boolean;
}

function formatDate(publishedAt: string | null, createdAt?: string): string {
  const dateStr = publishedAt || createdAt || null;
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function NewsCard({ news, featured = false }: Props) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const goDetail = () => navigate(`/article/${news.id}`, { state: { news } });

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(news.url);
    toast('링크가 복사됐습니다');
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) { toast('로그인 후 이용하세요'); return; }
    toast('변환 후 북마크할 수 있어요');
  };

  if (featured) {
    return (
      <div className="featured" onClick={goDetail}>
        <div className="featured-tag">뉴스</div>
        <div className="featured-title">{news.title}</div>
        <div className="featured-excerpt">{news.description}</div>
        <div className="featured-meta">
          <span>{news.source}</span><span className="sep">·</span>
          <span>{formatDate(news.publishedAt, news.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="news-row" onClick={goDetail}>
      <div className="news-body">
        <div className="news-tag">뉴스</div>
        <div className="news-title">{news.title}</div>
        <div className="news-excerpt">{news.description}</div>
        <div className="news-meta-row">
          <span>{news.source}</span><span className="sep">·</span>
          <span>{formatDate(news.publishedAt, news.createdAt)}</span>
        </div>
      </div>
      <div className="news-thumb"><span className="ms">article</span></div>
      <div className="news-row-actions">
        <button className={`row-action${!isLoggedIn ? ' locked' : ''}`} onClick={handleBookmark}>
          <span className="ms">bookmark</span>
        </button>
        <button className="row-action" onClick={handleShare}>
          <span className="ms">share</span>
        </button>
      </div>
    </div>
  );
}
