import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminLogin } from '@/lib/api/client';
import { setAuthCookies } from '@/lib/auth/cookies';
import { ApiRequestError } from '@/lib/api/types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const data = await adminLogin(body.email, body.password);

    if (data.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'This account is not authorized for admin access.' },
        { status: 403 }
      );
    }

    await setAuthCookies(
      data.accessToken,
      data.refreshToken,
      data.expiresIn,
      data.user
    );

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    if (error instanceof ApiRequestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status === 401 ? 401 : error.status }
      );
    }

    const message =
      error instanceof TypeError && error.message.includes('fetch')
        ? 'Cannot reach the backend API. Check API_URL in admin/.env.local (https://api.usepartylist.com).'
        : 'Unable to sign in. Please try again.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
