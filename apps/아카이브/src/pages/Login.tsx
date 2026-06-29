import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요.'); return; }
    setLoading(true);
    setError('');
    try {
      await login({ email, password });
      navigate('/');
      toast('환영합니다!');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-outer">
      <div className="auth-left">
        <div className="auth-left-logo">
          <div className="auth-logo-mark">NS</div>
          <span className="auth-logo-text">NewStory</span>
        </div>
        <div className="auth-headline">뉴스를<br />새롭게 읽다</div>
        <div className="auth-desc">AI가 어렵고 딱딱한 기사를<br />소설, 동화, 카드뉴스로 쉽게 변환해드립니다.</div>
      </div>
      <div className="auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-title">로그인</div>
          <div className="auth-form-sub">NewStory에 오신 것을 환영합니다</div>
          {error && <div className="auth-error">{error}</div>}
          <div className="field">
            <label>이메일</label>
            <input type="email" placeholder="hello@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>비밀번호</label>
            <input type="password" placeholder="비밀번호 입력" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
          <div className="auth-switch">
            계정이 없으신가요?{' '}
            <span className="auth-link" onClick={() => navigate('/signup')}>회원가입</span>
          </div>
        </form>
      </div>
    </div>
  );
}
