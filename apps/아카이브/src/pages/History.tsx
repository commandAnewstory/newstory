import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getHistory, deleteHistoryItem } from '../api/convert';
import { HistoryItem } from '../types';
import { STYLE_LIST } from '../data/mockData';
import './History.css';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function styleMeta(style: HistoryItem['style']) {
  return STYLE_LIST.find((s) => s.type === style);
}

export default function History() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<HistoryItem[] | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    getHistory()
      .then((d) => setItems(d.items))
      .catch(() => setItems([]));
  }, [isLoggedIn]);

  const handleDelete = async (resultId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteHistoryItem(resultId);
    setItems((prev) => prev?.filter((h) => h.resultId !== resultId) ?? []);
    toast('삭제됐습니다');
  };

  if (!isLoggedIn) {
    return (
      <>
        <div className="topbar">
          <span className="topbar-title">히스토리</span>
          <div className="topbar-right">
            <button className="btn-secondary" onClick={() => navigate('/login')}><span className="ms">login</span> 로그인</button>
            <button className="btn-primary" onClick={() => navigate('/signup')}><span className="ms">person_add</span> 회원가입</button>
          </div>
        </div>
        <div className="auth-gate-wrap">
          <div className="auth-gate">
            <div className="auth-gate-icon"><span className="ms">history</span></div>
            <h2>로그인 후 이용할 수 있습니다</h2>
            <p>변환한 기사 내역을 히스토리에서<br />언제든지 다시 확인할 수 있어요.</p>
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
        <span className="topbar-title">히스토리</span>
      </div>
      <div className="page">
        <p className="history-notice">최근 변환한 기사 50건까지 보관됩니다.</p>

        {items === null ? (
          <div className="loading-box">
            <div className="loading-spinner" />
            <p className="loading-text">불러오는 중...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="history-empty">
            <span className="ms">history</span>
            <p>아직 변환한 기사가 없어요.</p>
          </div>
        ) : (
          <div className="history-list">
            {items.map((item) => {
              const meta = styleMeta(item.style);
              return (
                <div
                  key={item.resultId}
                  className="history-row"
                  onClick={() => navigate(`/article/${item.resultId}`, { state: { fromSaved: true } })}
                >
                  <div className="history-icon">
                    <span className="ms">{meta?.icon ?? 'article'}</span>
                  </div>
                  <div className="history-body">
                    <div className="history-title">{item.title}</div>
                    <div className="history-meta">
                      <span className="history-style-badge">
                        <span className="ms">{meta?.icon ?? 'article'}</span>
                        {meta?.label ?? item.style}
                      </span>
                      <span className="sep">·</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                  <span
                    className="ms history-chevron"
                    onClick={(e) => handleDelete(item.resultId, e)}
                    title="삭제"
                  >delete</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
