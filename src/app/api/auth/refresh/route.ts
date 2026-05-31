import { NextResponse } from 'next/server';
import { refreshAdminSession } from '@/lib/api/client';
import { getRefreshToken, setAuthCookies } from '@/lib/auth/cookies';

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json({ error: 'No active session' }, { status: 401 });
  }

  try {
    const data = await refreshAdminSession(refreshToken);
    await setAuthCookies(
      data.accessToken,
      data.refreshToken,
      data.expiresIn,
      data.user
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }
}
