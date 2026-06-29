import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { login as apiLogin, logout as apiLogout, refresh as apiRefresh } from '../api/auth';

export function useAuth() {
  const { user, isLoggedIn, isLoading, setAuth, clearAuth, getRefreshToken, setAccessToken } = useAuthStore();

  const login = async (params: { email: string; password: string }) => {
    const data = await apiLogin(params);
    setAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken, nickname: data.nickname, email: params.email });
    return data;
  };

  const logout = async () => {
    try {
      const rt = getRefreshToken();
      if (rt) await apiLogout(rt);
    } catch (_) {}
    clearAuth();
  };

  // 필요 시 수동으로 accessToken 재발급 (보통은 api/client.ts가 401 발생 시 자동으로 처리함)
  const refreshAccessToken = async () => {
    const rt = getRefreshToken();
    if (!rt) {
      clearAuth();
      return null;
    }
    try {
      const { accessToken } = await apiRefresh(rt);
      setAccessToken(accessToken);
      return accessToken;
    } catch (_) {
      clearAuth();
      return null;
    }
  };

  return { user, isLoggedIn, isLoading, login, logout, refreshAccessToken };
}

export function useAuthInit() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => { init(); }, [init]);
}
