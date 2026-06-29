import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getBookmarks, getHistory } from '../api/convert';
import { updateProfile } from '../api/auth';
import useAuthStore from '../store/authStore';
import './Profile.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function Modal({ title, onClose, children, footer }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><span className="ms">close</span></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default function MyPage() {
  const { isLoggedIn, user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [modal, setModal] = useState<string | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  const [editNickname, setEditNickname] = useState('');
  const [editCurrentPw, setEditCurrentPw] = useState('');
  const [editNewPw, setEditNewPw] = useState('');
  const [editNewPwConfirm, setEditNewPwConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    getBookmarks().then((d) => setBookmarkCount(d.items.length)).catch(() => {});
    getHistory().then((d) => setHistoryCount(d.items.length)).catch(() => {});
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast('로그아웃 됐습니다');
  };

  const openEditModal = () => {
    setEditNickname(user?.nickname ?? '');
    setEditCurrentPw('');
    setEditNewPw('');
    setEditNewPwConfirm('');
    setModal('edit');
  };

  const handleSaveProfile = async () => {
    if (editNewPw && editNewPw !== editNewPwConfirm) {
      toast('새 비밀번호가 일치하지 않습니다');
      return;
    }
    if (editNewPw && editNewPw.length < 8) {
      toast('새 비밀번호는 8자 이상이어야 합니다');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        nickname: editNickname || undefined,
        currentPassword: editCurrentPw || undefined,
        newPassword: editNewPw || undefined,
      });
      useAuthStore.getState().setAuth({
        accessToken: localStorage.getItem('accessToken') ?? '',
        refreshToken: localStorage.getItem('refreshToken') ?? '',
        nickname: editNickname || (user?.nickname ?? ''),
        email: user?.email ?? '',
      });
      toast('프로필이 수정됐습니다');
      setModal(null);
    } catch (err: any) {
      toast(err.message || '수정에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <div className="topbar">
          <span className="topbar-title">내 정보</span>
          <div className="topbar-right">
            <button className="btn-secondary" onClick={() => navigate('/login')}><span className="ms">login</span> 로그인</button>
            <button className="btn-primary" onClick={() => navigate('/signup')}><span className="ms">person_add</span> 회원가입</button>
          </div>
        </div>
        <div className="auth-gate-wrap">
          <div className="auth-gate">
            <div className="auth-gate-icon"><span className="ms">person</span></div>
            <h2>로그인 후 이용할 수 있습니다</h2>
            <p>프로필, 계정 관리 등<br />내 정보 기능은 회원 전용입니다.</p>
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
      <div className="topbar"><span className="topbar-title">내 정보</span></div>
      <div className="page">
        <div className="profile-layout">

          {/* 프로필 카드 */}
          <div className="profile-card">
            <div className="profile-avatar">{user?.nickname?.[0] ?? 'U'}</div>
            <div className="profile-name">{user?.nickname}</div>
            <div className="profile-email">{user?.email}</div>
            <div className="profile-stats">
              <div className="stat-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/bookmarks')}>
                <div className="stat-num">{bookmarkCount}</div>
                <div className="stat-label">보관</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">{historyCount}</div>
                <div className="stat-label">히스토리</div>
              </div>
            </div>
          </div>

          {/* 설정 목록 */}
          <div className="settings-wrap">
            <div className="settings-section">
              <div className="section-label">계정</div>
              <div className="settings-rows">
                <div className="settings-row" onClick={openEditModal}>
                  <span className="ms row-icon">person</span>
                  <div className="settings-row-text">
                    <div className="settings-row-title">프로필 수정</div>
                    <div className="settings-row-sub">닉네임, 이메일, 비밀번호 변경</div>
                  </div>
                  <span className="ms chevron">chevron_right</span>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="section-label">기타</div>
              <div className="settings-rows">
                <div className="settings-row" onClick={() => setModal('help')}>
                  <span className="ms row-icon">help</span>
                  <div className="settings-row-text">
                    <div className="settings-row-title">도움말</div>
                    <div className="settings-row-sub">앱 사용법 및 FAQ</div>
                  </div>
                  <span className="ms chevron">chevron_right</span>
                </div>
                <div className="settings-row danger" onClick={handleLogout}>
                  <span className="ms row-icon danger-icon">logout</span>
                  <div className="settings-row-text">
                    <div className="settings-row-title danger-text">로그아웃</div>
                  </div>
                  <span className="ms chevron">chevron_right</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 프로필 수정 모달 */}
      {modal === 'edit' && (
        <Modal
          title="프로필 수정"
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="modal-btn-secondary" onClick={() => setModal(null)} disabled={saving}>취소</button>
              <button className="modal-btn-primary" onClick={handleSaveProfile} disabled={saving}>
                {saving ? '저장 중…' : '저장'}
              </button>
            </>
          }
        >
          <div className="modal-field">
            <label>닉네임</label>
            <input type="text" value={editNickname} onChange={(e) => setEditNickname(e.target.value)} />
          </div>
          <div className="modal-field">
            <label>이메일</label>
            <input type="email" value={user?.email ?? ''} disabled style={{ opacity: 0.5 }} />
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>비밀번호 변경 (선택)</div>
          <div className="modal-field">
            <label>현재 비밀번호</label>
            <input type="password" value={editCurrentPw} onChange={(e) => setEditCurrentPw(e.target.value)} placeholder="현재 비밀번호 입력" />
          </div>
          <div className="modal-field">
            <label>새 비밀번호</label>
            <input type="password" value={editNewPw} onChange={(e) => setEditNewPw(e.target.value)} placeholder="새 비밀번호 (8자 이상)" />
          </div>
          <div className="modal-field">
            <label>새 비밀번호 확인</label>
            <input type="password" value={editNewPwConfirm} onChange={(e) => setEditNewPwConfirm(e.target.value)} placeholder="새 비밀번호 재입력" />
          </div>
        </Modal>
      )}

      {/* 도움말 모달 */}
      {modal === 'help' && (
        <Modal
          title="도움말"
          onClose={() => setModal(null)}
          footer={<button className="modal-btn-primary" onClick={() => setModal(null)}>닫기</button>}
        >
          <div className="help-list">
            <div className="help-section-title"><span className="ms">auto_awesome</span> 뉴스 변환</div>
            <div className="help-item">
              <div className="help-q">카드뉴스 / 소설 / 동화가 뭔가요?</div>
              <div className="help-a">같은 뉴스 기사를 세 가지 형식으로 변환해드려요. 카드뉴스는 핵심만 요점 정리, 소설은 3인칭 서사 문체, 동화는 초등학생도 이해할 수 있는 쉬운 언어로 바꿔줍니다.</div>
            </div>
            <div className="help-item">
              <div className="help-q">직접 변환은 어떻게 쓰나요?</div>
              <div className="help-a">사이드바의 직접 변환을 클릭하고, URL을 붙여넣은 뒤 스타일을 선택하고 변환 버튼을 눌러요.</div>
            </div>
            <div className="help-section-title" style={{ marginTop: '20px' }}><span className="ms">inventory_2</span> 보관소</div>
            <div className="help-item">
              <div className="help-q">기사를 어떻게 저장하나요?</div>
              <div className="help-a">변환 후 북마크 아이콘을 누르면 보관소에 저장돼요.</div>
            </div>
            <div className="help-section-title" style={{ marginTop: '20px' }}><span className="ms">help</span> 기타</div>
            <div className="help-item">
              <div className="help-q">문의나 피드백은 어디에 남기나요?</div>
              <div className="help-a">newstory@example.com 으로 이메일 주시면 빠르게 답변드릴게요.</div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
