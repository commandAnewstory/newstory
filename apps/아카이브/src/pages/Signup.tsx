import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { signup } from '../api/auth';
import './Auth.css';

interface FormState {
  nickname: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export default function Signup() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ nickname: '', email: '', password: '', passwordConfirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setField = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.nickname || !form.email || !form.password) { setError('모든 항목을 입력해주세요.'); return; }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (form.password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    setLoading(true);
    try {
      await signup({ email: form.email, password: form.password, nickname: form.nickname });
      await login({ email: form.email, password: form.password });
      toast('가입이 완료됐습니다!');
      navigate('/');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
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
          <div className="auth-form-title">회원가입</div>
          <div className="auth-form-sub">무료로 시작하세요</div>
          {error && <div className="auth-error">{error}</div>}
          <div className="field">
            <label>닉네임</label>
            <input type="text" placeholder="홍길동" value={form.nickname} onChange={setField('nickname')} />
          </div>
          <div className="field">
            <label>이메일</label>
            <input type="email" placeholder="hello@example.com" value={form.email} onChange={setField('email')} />
          </div>
          <div className="field">
            <label>비밀번호</label>
            <input type="password" placeholder="8자 이상 입력" value={form.password} onChange={setField('password')} />
          </div>
          <div className="field">
            <label>비밀번호 확인</label>
            <input type="password" placeholder="비밀번호 재입력" value={form.passwordConfirm} onChange={setField('passwordConfirm')} />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? '가입 중...' : '가입하기'}
          </button>
          <div className="auth-switch">
            이미 계정이 있으신가요?{' '}
            <span className="auth-link" onClick={() => navigate('/login')}>로그인</span>
          </div>
        </form>
      </div>
    </div>
  );
}
