import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-logo">
        <div className="logo-mark">NS</div>
        <span className="logo-text">NewStory</span>
      </NavLink>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="ms">home</span> 홈
        </NavLink>
        <NavLink to="/convert" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="ms">auto_awesome</span> 직접 변환
        </NavLink>
        <NavLink to="/bookmarks" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="ms">inventory_2</span> 보관소
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="ms">history</span> 히스토리
        </NavLink>
        <NavLink to="/mypage" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="ms">person</span> 내 정보
        </NavLink>
      </nav>

      {isLoggedIn ? (
        <div className="sidebar-footer">
          <div className="user-row" onClick={() => navigate('/mypage')}>
            <div className="avatar">{user?.nickname?.[0] ?? 'U'}</div>
            <div className="user-info">
              <div className="user-name">{user?.nickname}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="sidebar-guest-footer">
          <button className="btn-sidebar-login" onClick={() => navigate('/login')}>로그인</button>
          <button className="btn-sidebar-signup" onClick={() => navigate('/signup')}>회원가입</button>
        </div>
      )}
    </aside>
  );
}
