import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFeed } from '../hooks/useFeed';
import NewsCard from '../components/NewsCard';
import StyleTab from '../components/StyleTab';
import { ConvertStyle, NewsItem } from '../types';
import { getPopularNews } from '../api/feed';
import './Home.css';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  '경제': ['경제', '금리', '주식', '환율', '반도체', '수출', '기업', '투자', '시장', '물가', '금융', '증시', '부동산', '세금', '재정', '무역', '소비', '고용', '실업', 'GDP', '인플레', '채권', '펀드', '은행'],
  '과학·IT': ['과학', 'IT', 'AI', '인공지능', '기술', '개발', '소프트웨어', '반도체', '디지털', '앱', '플랫폼', '로봇', '우주', '에너지', '기후', '스타트업', '데이터', '클라우드', '메타버스', '블록체인'],
  '스포츠': ['스포츠', '축구', '야구', '농구', '올림픽', '월드컵', '선수', '경기', '리그', '골프', '배구', '테니스', '수영', '육상', '감독', '우승', '득점', '승리', '패배'],
  '정치': ['정치', '대통령', '국회', '선거', '정부', '민주당', '국민의힘', '정당', '의원', '청와대', '장관', '총리', '여야', '법안', '탄핵', '개헌', '국정', '여당', '야당'],
  '사회': ['사회', '범죄', '교육', '복지', '의료', '환경', '사건', '사고', '경찰', '법원', '학교', '대학', '병원', '화재', '재난', '청년', '저출생', '노인', '인구'],
  '국제': ['국제', '미국', '중국', '일본', '트럼프', '바이든', '전쟁', '외교', '유럽', '러시아', '북한', '우크라이나', '이스라엘', '중동', 'UN', 'NATO', '정상회담', '제재', '협약'],
  '문화': ['문화', '영화', '음악', '예술', '드라마', '공연', '전시', '문학', '방송', '연예', '배우', '가수', '아이돌', '넷플릭스', '웹툰', '게임', '패션', '푸드', '여행'],
};

const ALL_KEYWORDS = Object.values(CATEGORY_KEYWORDS).flat();

export default function Home() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { items, loading, loadingMore, error, loadMore, hasMore } = useFeed();
  const [activeCategory, setActiveCategory] = useState('전체');
  const [activeStyle, setActiveStyle] = useState<ConvertStyle | null>(null);
  const [popular, setPopular] = useState<NewsItem[]>([]);

  useEffect(() => {
    getPopularNews().then(setPopular).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === '전체') return items;
    if (activeCategory === '기타') {
      return items.filter((n) => {
        const text = `${n.title ?? ''} ${n.description ?? ''}`;
        return !ALL_KEYWORDS.some((kw) => text.includes(kw));
      });
    }
    const keywords = CATEGORY_KEYWORDS[activeCategory] ?? [];
    return items.filter((n) => {
      const text = `${n.title ?? ''} ${n.description ?? ''}`;
      return keywords.some((kw) => text.includes(kw));
    });
  }, [items, activeCategory]);

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">오늘의 뉴스</span>
        <div className="topbar-right">
          {!isLoggedIn && (
            <>
              <button className="btn-secondary" onClick={() => navigate('/login')}>
                <span className="ms">login</span> 로그인
              </button>
              <button className="btn-primary" onClick={() => navigate('/signup')}>
                <span className="ms">person_add</span> 회원가입
              </button>
            </>
          )}
        </div>
      </div>

      {popular.length > 0 && (
        <div className="popular-section">
          <div className="popular-header">
            <span className="ms">local_fire_department</span>
            이번 주 인기 뉴스
          </div>
          <div className="popular-list">
            {popular.map((news, idx) => (
              <div
                key={news.id}
                className="popular-item"
                onClick={() => navigate(`/article/${news.id}`, { state: { news } })}
              >
                <span className="popular-rank">{idx + 1}</span>
                <div className="popular-title">{news.title}</div>
                {news.source && <span className="popular-source">{news.source}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <StyleTab
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activeStyle={activeStyle}
        onStyleChange={setActiveStyle}
        showStyleTabs={isLoggedIn}
      />

      <div className="page">
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="loading-spinner" />
          </div>
        )}
        {error && <div className="feed-error">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="history-empty">
            <span className="ms">search_off</span>
            <p>해당 카테고리의 뉴스가 없습니다.</p>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="news-list">
              {filtered.map((news) => <NewsCard key={news.id} news={news} />)}
            </div>

            {hasMore && activeCategory === '전체' && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <button
                  className="btn-secondary"
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{ minWidth: '160px', justifyContent: 'center' }}
                >
                  {loadingMore
                    ? <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    : <><span className="ms">expand_more</span> 뉴스 더 보기</>
                  }
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
