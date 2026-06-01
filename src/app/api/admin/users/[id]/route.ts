import { NextResponse } from 'next/server';
import { getUserDetail } from '@/lib/api/users';
import { ApiRequestError } from '@/lib/api/types';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await getUserDetail(id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to load user' }, { status: 500 });
  }
}
