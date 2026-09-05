export const AUTH_COOKIES = {
  accessToken: 'admin_access_token',
  refreshToken: 'admin_refresh_token',
  user: 'admin_user',
} as const;

/** Refresh token lifetime aligned with backend admin refresh (60 days). */
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 24 * 60 * 60;

export const PUBLIC_ROUTES = ['/login'] as const;

export const AUTH_API_ROUTES = ['/api/auth/login', '/api/auth/logout', '/api/auth/refresh'] as const;
