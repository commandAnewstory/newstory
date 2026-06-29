import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  init: () => void;
  setAuth: (params: { accessToken: string; refreshToken: string; nickname: string; email: string }) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,

  init: () => {
    const token = localStorage.getItem('accessToken');
    const nickname = localStorage.getItem('nickname') || '';
    const email = localStorage.getItem('email') || '';
    if (token && nickname) {
      set({ user: { nickname, email }, isLoggedIn: true, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  setAuth: ({ accessToken, refreshToken, nickname, email }) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('nickname', nickname);
    localStorage.setItem('email', email);
    set({ user: { nickname, email }, isLoggedIn: true });
  },

  // accessToken만 갈아끼움 (refresh 성공 시 사용). 로그인 상태나 user 정보는 그대로 유지.
  setAccessToken: (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('nickname');
    localStorage.removeItem('email');
    set({ user: null, isLoggedIn: false });
  },

  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
}));

export default useAuthStore;
