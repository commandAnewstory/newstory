import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getBookmarks, deleteBookmark } from '../api/convert';
import { BookmarkItem } from '../types';
import { STYLE_LIST } from '../data/mockData';
import './Bookmark.css';

function formatDate(d: string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;
}

export default function Bookmarks() {
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    getBookmarks()
      .then((d) => setBookmarks(d.items))
      .catch((err: any) => toast(err.message || '보관함을 불러오지 못했습니다'))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const handleDelete = async (resultId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteBookmark(resultId);
    setBookmarks((prev) => prev.filter((b) => b.resultId !== resultId));
    toast('삭제됐습니다');
  };

  const filtered = bookmarks.filter(
    (b) => !query || b.title.toLowerCase().includes(query.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <>
        <div className="topbar">
          <span className="topbar-title">보관소</span>
          <div className="topbar-right">
            <button className="btn-secondary" onClick={() => navigate('/login')}><span className="ms">login</span> 로그인</button>
            <button className="btn-primary" onClick={() => navigate('/signup')}><span className="ms">person_add</span> 회원가입</button>
          </div>
        </div>
        <div className="auth-gate-wrap">
          <div className="auth-gate">
            <div className="auth-gate-icon"><span className="ms">inventory_2</span></div>
            <h2>로그인 후 이용할 수 있습니다</h2>
            <p>변환한 기사를 보관소에 저장하고<br />언제든지 다시 꺼내볼 수 있어요.</p>
            <div className="auth-gate-btns">
              <button className="btn-gate-primary" onClick={() => navigate('/login')}><span className="ms">login</span> 로그인</button>
              <button className="btn-gate-secondary" onClick={() => navigate('/signup')}>회원가입</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">보관소</span>
      </div>
      <div className="page">
        <div className={`bm-search-bar${query ? ' has-value' : ''}`}>
          <span className="ms bm-search-icon">search</span>
          <input
            className="bm-search-input"
            placeholder="보관된 기사 검색…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="bm-clear-btn" onClick={() => setQuery('')}>
              <span className="ms">close</span>
            </button>
          )}
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="loading-spinner" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bm-empty">
            <span className="ms">{query ? 'search_off' : 'inventory_2'}</span>
            <p>{query ? '검색 결과가 없습니다.' : '아직 보관된 기사가 없습니다.'}</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="bm-grid">
            {filtered.map((bm) => {
              const s = STYLE_LIST.find((x) => x.type === bm.style);
              return (
                <div key={bm.bookmarkId} className="bm-card" onClick={() => navigate(`/article/${bm.resultId}`, { state: { fromSaved: true } })}>
                  <div className="bm-card-top">
                    <div className="bm-tag">뉴스</div>
                    <div className="bm-style-badge"><span className="ms">{s?.icon}</span> {s?.label}</div>
                  </div>
                  <div className="bm-title">{bm.title}</div>
                  <div className="bm-meta">
                    <span>{formatDate(bm.savedAt)}</span>
                    <span className="ms bm-remove" onClick={(e) => handleDelete(bm.resultId, e)}>delete</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
