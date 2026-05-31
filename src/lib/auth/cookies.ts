import { cookies } from 'next/headers';
import type { AdminUser } from '@/lib/api/types';
import { AUTH_COOKIES, REFRESH_TOKEN_MAX_AGE_SECONDS } from './constants';

function baseCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  expiresInSeconds: number,
  user: AdminUser
) {
  const store = await cookies();
  store.set(AUTH_COOKIES.accessToken, accessToken, baseCookieOptions(expiresInSeconds));
  store.set(
    AUTH_COOKIES.refreshToken,
    refreshToken,
    baseCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS)
  );
  store.set(
    AUTH_COOKIES.user,
    JSON.stringify(user),
    baseCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS)
  );
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(AUTH_COOKIES.accessToken);
  store.delete(AUTH_COOKIES.refreshToken);
  store.delete(AUTH_COOKIES.user);
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_COOKIES.accessToken)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_COOKIES.refreshToken)?.value;
}

export async function getStoredUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const raw = store.get(AUTH_COOKIES.user)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}
