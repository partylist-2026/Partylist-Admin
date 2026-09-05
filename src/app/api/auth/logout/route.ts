import { NextResponse } from 'next/server';
import { revokeRefreshToken } from '@/lib/api/client';
import { clearAuthCookies, getRefreshToken } from '@/lib/auth/cookies';

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    try {
      await revokeRefreshToken(refreshToken);
    } catch {
      // Clear local session even if backend revoke fails.
    }
  }

  await clearAuthCookies();

  return NextResponse.json({ success: true });
}
