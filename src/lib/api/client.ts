import { env } from '@/lib/env';
import {
  ApiErrorBody,
  ApiRequestError,
  ApiSuccess,
  AdminLoginResponse,
} from '@/lib/api/types';
import { getAccessToken, getRefreshToken, setAuthCookies } from '@/lib/auth/cookies';

const API_BASE = `${env.API_URL}/api/v1`;

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiErrorBody;

  if (!response.ok || !('success' in body) || !body.success) {
    const message =
      'error' in body && body.error?.message
        ? body.error.message
        : 'Request failed';
    const code = 'error' in body ? body.error?.code : undefined;
    throw new ApiRequestError(message, response.status, code);
  }

  return body.data;
}

export async function adminLogin(
  email: string,
  password: string
): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  return parseResponse<AdminLoginResponse>(response);
}

export async function refreshAdminSession(refreshToken: string): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  return parseResponse<AdminLoginResponse>(response);
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });
}

export { getAccessToken, getRefreshToken, setAuthCookies };

export async function adminFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const { getValidAccessToken } = await import('@/lib/auth/session');
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    throw new ApiRequestError('Not authenticated', 401, 'AUTH_REQUIRED');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  return parseResponse<T>(response);
}

export type { AdminUser } from '@/lib/api/types';
