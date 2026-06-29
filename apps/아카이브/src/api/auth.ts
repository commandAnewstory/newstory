const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  const json: ApiResponse<T> | null = text ? JSON.parse(text) : null;

  if (!res.ok || !json || !json.success) {
    const msg = json?.message || '요청 처리 중 오류가 발생했습니다.';
    throw new Error(msg);
  }

  return json.data;
}

export interface SignupParams {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  nickname: string;
}

export interface RefreshResult {
  accessToken: string;
}

export async function signup(params: SignupParams): Promise<void> {
  await request<void>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function login(params: LoginParams): Promise<LoginResult> {
  return request<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function logout(refreshToken: string): Promise<void> {
  await request<void>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function refresh(refreshToken: string): Promise<RefreshResult> {
  return request<RefreshResult>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export interface UpdateProfileParams {
  nickname?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function updateProfile(params: UpdateProfileParams): Promise<void> {
  const token = localStorage.getItem('accessToken');
  await request<void>('/api/users/me', {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(params),
  });
}
