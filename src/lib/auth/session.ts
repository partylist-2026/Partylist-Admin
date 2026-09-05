import {
  getRefreshToken,
  getStoredUser,
  setAuthCookies,
} from '@/lib/auth/cookies';
import { refreshAdminSession } from '@/lib/api/client';
import type { AdminUser } from '@/lib/api/types';

export interface AdminSession {
  user: AdminUser;
  isAuthenticated: true;
}

export async function getValidAccessToken(): Promise<string | null> {
  const { getAccessToken } = await import('@/lib/auth/cookies');
  const accessToken = await getAccessToken();
  if (accessToken) return accessToken;

  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const data = await refreshAdminSession(refreshToken);
    await setAuthCookies(
      data.accessToken,
      data.refreshToken,
      data.expiresIn,
      data.user
    );
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const accessToken = await getValidAccessToken();
  if (!accessToken) return null;

  const user = await getStoredUser();
  if (!user || user.role !== 'ADMIN') return null;

  return { user, isAuthenticated: true };
}
