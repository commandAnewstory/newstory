import useAuthStore from '../store/authStore';
import { refresh as apiRefresh } from './auth';

const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8080';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

let refreshPromise: Promise<string | null> | null = null;

// 동시에 여러 요청이 401을 받아도 refresh는 한 번만 실행되도록 공유
function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  const rt = useAuthStore.getState().getRefreshToken();
  if (!rt) return Promise.resolve(null);

  refreshPromise = apiRefresh(rt)
    .then(({ accessToken }) => {
      useAuthStore.getState().setAccessToken(accessToken);
      return accessToken;
    })
    .catch(() => {
      useAuthStore.getState().clearAuth();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // true면 Authorization 헤더 부착 + 401 시 자동 재발급
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, headers, ...rest } = options;

  const buildHeaders = (): HeadersInit => {
    const h: Record<string, string> = { 'Content-Type': 'application/json', ...(headers as Record<string, string> | undefined) };
    if (auth) {
      const token = useAuthStore.getState().getAccessToken();
      if (token) h['Authorization'] = `Bearer ${token}`;
    }
    return h;
  };

  let res = await fetch(`${API_BASE}${path}`, { ...rest, headers: buildHeaders() });

  // accessToken 만료로 추정되는 401 → 재발급 후 한 번만 재시도
  if (res.status === 401 && auth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await fetch(`${API_BASE}${path}`, { ...rest, headers: buildHeaders() });
    }
  }

  const text = await res.text();
  const json: ApiResponse<T> | null = text ? JSON.parse(text) : null;

  if (!res.ok || !json || !json.success) {
    const msg = json?.message || '요청 처리 중 오류가 발생했습니다.';
    throw new Error(msg);
  }

  return json.data;
}
