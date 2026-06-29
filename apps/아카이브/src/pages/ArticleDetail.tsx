import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { NewsItem, ConvertStyle, ConvertResult, OriginalArticle } from '../types';
import { STYLE_LIST, MOCK_NEWS } from '../data/mockData';
import { convertArticle, addBookmark, getOriginal, getConvertResult } from '../api/convert';
import { recordView } from '../api/feed';
import ConvertedContent from '../components/ConvertedContent';
import { getCachedResult, setCachedResult, clearExpiredCache } from '../utils/convertCache';
import './Detail.css';

function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];
  const byNewline = text.split(/\n+/).filter((p) => p.trim());
  if (byNewline.length > 1) return byNewline;
  const sentences = text.match(/[^.!?]*[.!?]+/g) ?? [];
  if (sentences.length <= 3) return [text];
  const grouped: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    grouped.push(sentences.slice(i, i + 3).join('').trim());
  }
  return grouped.filter((p) => p);
}

function formatDate(publishedAt: string | null | undefined, createdAt?: string): string {
  const raw = publishedAt || createdAt || null;
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const stateNews = (location.state as { news?: NewsItem } | null)?.news;
  const news = stateNews ?? MOCK_NEWS.find((n) => n.id === Number(id)) ?? null;

  const [original, setOriginal] = useState<OriginalArticle | null>(null);
  const [loadingOriginal, setLoadingOriginal] = useState(false);
  const [originalError, setOriginalError] = useState<string | null>(null);

  const [activeStyle, setActiveStyle] = useState<ConvertStyle | null>(null);
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [converting, setConverting] = useState(false);
  const [styleCache, setStyleCache] = useState<Map<ConvertStyle, ConvertResult>>(new Map());

  // 확인 다이얼로그 상태
  const [confirmStyle, setConfirmStyle] = useState<ConvertStyle | null>(null);

  const fromSavedResult = (location.state as { fromSaved?: boolean } | null)?.fromSaved === true;

  const paragraphs = useMemo(() => splitIntoParagraphs(original?.content ?? ''), [original]);

  useEffect(() => {
    clearExpiredCache();
  }, []);

  useEffect(() => {
    if (news?.id) {
      recordView(news.id);
    }

    if (fromSavedResult) {
      getConvertResult(Number(id))
        .then((result) => {
          setConvertResult(result);
          setActiveStyle(result.style);
        })
        .catch((err: any) => toast(err.message || '결과를 불러오지 못했습니다'));
      return;
    }

    if (!news?.url) return;
    setLoadingOriginal(true);
    setOriginalError(null);
    getOriginal(news.url)
      .then(setOriginal)
      .catch((err: any) => setOriginalError(err.message || '원문을 불러오지 못했습니다'))
      .finally(() => setLoadingOriginal(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [news?.url, fromSavedResult, id]);

  const handleStyleClick = (style: ConvertStyle) => {
    if (!isLoggedIn) { toast('로그인 후 이용할 수 있습니다'); return; }
    if (!news?.url) return;

    // 같은 스타일 클릭 → 토글 off
    if (activeStyle === style) {
      setActiveStyle(null);
      setConvertResult(null);
      return;
    }

    // 세션 캐시 확인
    if (styleCache.has(style)) {
      setActiveStyle(style);
      setConvertResult(styleCache.get(style)!);
      return;
    }

    // localStorage 24시간 캐시 확인
    if (news?.id) {
      const cached = getCachedResult(news.id, style);
      if (cached) {
        setStyleCache((prev) => new Map(prev).set(style, cached));
        setActiveStyle(style);
        setConvertResult(cached);
        return;
      }
    }

    // 캐시 없으면 확인 다이얼로그
    setConfirmStyle(style);
  };

  const handleConfirmConvert = async () => {
    if (!confirmStyle || !news?.url) return;
    const style = confirmStyle;
    setConfirmStyle(null);
    setActiveStyle(style);
    setConverting(true);
    try {
      const result = await convertArticle({ url: news.url, style });
      setStyleCache((prev) => new Map(prev).set(style, result));
      setConvertResult(result);
      if (news?.id) setCachedResult(news.id, result);
    } catch (err: any) {
      toast(err.message || '변환 중 오류가 발생했습니다');
      setActiveStyle(null);
    } finally {
      setConverting(false);
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) { toast('로그인 후 이용할 수 있습니다'); return; }
    if (!convertResult) { toast('먼저 변환해주세요'); return; }
    try {
      await addBookmark(convertResult.resultId);
      toast('보관함에 저장됐습니다');
    } catch (err: any) {
      toast(err.message || '저장에 실패했습니다');
    }
  };

  if (fromSavedResult && !convertResult) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!fromSavedResult && !news) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--gray-500)' }}>기사를 찾을 수 없습니다.</span>
      </div>
    );
  }

  const displayTitle = original?.title ?? news?.title ?? convertResult?.title ?? '';
  const displayUrl = original?.originalUrl ?? news?.url ?? convertResult?.originalUrl ?? '';
  const dateStr = formatDate(news?.publishedAt, news?.createdAt);
  const confirmStyleInfo = STYLE_LIST.find((s) => s.type === confirmStyle);

  return (
    <>
      <div className="topbar">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <span className="ms">arrow_back</span>
        </button>
        <span style={{ fontSize: '14px', color: 'var(--gray-500)' }}>기사 상세</span>
        <div className="topbar-right">
          <button className="icon-btn" onClick={() => { navigator.clipboard?.writeText(displayUrl); toast('링크 복사됐습니다'); }}>
            <span className="ms">share</span>
          </button>
          <button className="icon-btn" onClick={handleBookmark}>
            <span className="ms">bookmark</span>
          </button>
        </div>
      </div>

      <div className="page">
        <div className="detail-layout">
          <div>
            <div className="detail-tag">뉴스</div>
            <div className="detail-title-row">
              <h1 className="detail-title">{displayTitle}</h1>
              {dateStr && <span className="detail-date">{dateStr}</span>}
            </div>
            <div className="detail-meta">
              {news?.source && <><span>{news.source}</span><span className="sep">·</span></>}
              <a href={displayUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)', marginLeft: 'auto' }}>원본 기사</a>
            </div>

            {/* 생성 중 */}
            {converting && (
              <div className="convert-loading-view">
                <div className="loading-spinner large" />
                <div className="convert-loading-text">AI가 변환 중입니다…</div>
                <div className="convert-loading-sub">잠시만 기다려 주세요</div>
              </div>
            )}

            {/* 변환 결과 */}
            {convertResult && !converting && (
              <div className="converted-view">
                <div className="converted-view-header">
                  {!fromSavedResult && (
                    <button className="converted-back-btn" onClick={() => { setActiveStyle(null); setConvertResult(null); }}>
                      <span className="ms">arrow_back</span> 원문 보기
                    </button>
                  )}
                  {fromSavedResult && <div />}
                  <div className="converted-view-badge">
                    <span className="ms">{STYLE_LIST.find((s) => s.type === convertResult.style)?.icon}</span>
                    {STYLE_LIST.find((s) => s.type === convertResult.style)?.label}로 변환됨
                  </div>
                </div>
                <div className="converted-view-body">
                  <ConvertedContent text={convertResult.convertedText} style={convertResult.style} />
                </div>
              </div>
            )}

            {/* 원문 */}
            {!fromSavedResult && !converting && !convertResult && (
              <div className="detail-body">
                {loadingOriginal && (
                  <div className="loading-box">
                    <div className="loading-spinner" />
                    <div className="loading-text">원문을 불러오는 중…</div>
                  </div>
                )}
                {originalError && !loadingOriginal && (
                  <div className="feed-error">{originalError}</div>
                )}
                {original && !loadingOriginal && (
                  original.contentHtml ? (
                    <div
                      className="article-html-body"
                      dangerouslySetInnerHTML={{ __html: original.contentHtml }}
                    />
                  ) : (
                    <>
                      {paragraphs.map((para, i) => (
                        <p key={i} className={i === 0 ? 'article-lede' : undefined}>{para}</p>
                      ))}
                    </>
                  )
                )}
                {!original && !loadingOriginal && !originalError && news && (
                  <p className="article-lede">{news.description}</p>
                )}
              </div>
            )}
          </div>

          {!fromSavedResult && (
            <div className="format-panel">
              <div className="panel-label">스타일 변환</div>
              <div className="format-btns">
                {STYLE_LIST.map((s) => {
                  const hasCached = styleCache.has(s.type) || (news?.id ? !!getCachedResult(news.id, s.type) : false);
                  const isActive = activeStyle === s.type;
                  return (
                    <button
                      key={s.type}
                      className={`fmt-btn${isActive ? ' active' : ''}${hasCached && !isActive ? ' cached' : ''}${!isLoggedIn ? ' locked' : ''}`}
                      onClick={() => handleStyleClick(s.type)}
                      disabled={converting}
                    >
                      <span className="ms">{s.icon}</span>
                      <div className="fmt-info">
                        <div className="fmt-title">{s.label}</div>
                        <div className="fmt-sub">{hasCached && !isActive ? '저장됨 · 클릭하여 보기' : s.sub}</div>
                      </div>
                      {hasCached && !isActive && (
                        <span className="ms" style={{ fontSize: '14px', color: 'var(--sapphire)', marginLeft: 'auto' }}>check_circle</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {!isLoggedIn && (
                <div className="detail-login-cta">
                  <p>로그인하면 기사를 다양한 스타일로 변환할 수 있어요.</p>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} onClick={() => navigate('/login')}>
                    <span className="ms">login</span> 로그인
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 변환 확인 다이얼로그 */}
      {confirmStyle && confirmStyleInfo && (
        <div className="modal-overlay" onClick={() => setConfirmStyle(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="ms" style={{ marginRight: '6px', verticalAlign: 'middle' }}>{confirmStyleInfo.icon}</span>
                {confirmStyleInfo.label} 스타일로 변환
              </div>
              <button className="modal-close" onClick={() => setConfirmStyle(null)}><span className="ms">close</span></button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--gray-700)', lineHeight: 1.6 }}>
                이 기사를 <strong>{confirmStyleInfo.label}</strong> 스타일로 변환하시겠습니까?
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--gray-500)' }}>{confirmStyleInfo.sub}</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-secondary" onClick={() => setConfirmStyle(null)}>취소</button>
              <button className="modal-btn-primary" onClick={handleConfirmConvert}>변환하기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
