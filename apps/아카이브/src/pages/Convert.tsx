import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useConvert } from '../hooks/useConvert';
import { useToast } from '../hooks/useToast';
import ConvertForm, { ConvertFormHandle } from '../components/ConvertForm';
import ConvertResultView from '../components/ConvertResult';
import { ConvertStyle } from '../types';
import './Convert.css';

export default function Convert() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { convert, result, loading, error, reset } = useConvert();
  const formRef = useRef<ConvertFormHandle>(null);

  const handleConvert = async (params: { url: string; style: ConvertStyle }) => {
    try {
      await convert(params);
      toast('변환 완료!');
    } catch (_) {}
  };

  const handleReset = () => {
    reset();
    formRef.current?.reset();
  };

  if (!isLoggedIn) {
    return (
      <>
        <div className="topbar">
          <span className="topbar-title">직접 변환</span>
          <div className="topbar-right">
            <button className="btn-secondary" onClick={() => navigate('/login')}><span className="ms">login</span> 로그인</button>
            <button className="btn-primary" onClick={() => navigate('/signup')}><span className="ms">person_add</span> 회원가입</button>
          </div>
        </div>
        <div className="auth-gate-wrap">
          <div className="auth-gate">
            <div className="auth-gate-icon"><span className="ms">auto_awesome</span></div>
            <h2>로그인 후 이용할 수 있습니다</h2>
            <p>URL만 붙여넣으면 AI가 기사를<br />소설·동화·카드뉴스로 변환해드려요.</p>
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
        <span className="topbar-title">직접 변환</span>
        <div className="topbar-right">
          <button className="btn-secondary" onClick={() => navigate('/history')}><span className="ms">history</span> 히스토리</button>
        </div>
      </div>
      <div className="page">
        <div className="convert-layout">
          <ConvertForm ref={formRef} onConvert={handleConvert} loading={loading} />
          {loading && (
            <div className="loading-box">
              <div className="loading-spinner" />
              <div className="loading-text">AI가 기사를 분석하고 있습니다…</div>
            </div>
          )}
          {error && <div className="convert-error"><span className="ms">error</span> {error}</div>}
          {result && !loading && <ConvertResultView result={result} onReset={handleReset} />}
        </div>
      </div>
    </>
  );
}
