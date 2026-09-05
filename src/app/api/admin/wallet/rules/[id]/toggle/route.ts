import { NextResponse } from 'next/server';
import { toggleWalletRule } from '@/lib/api/wallet';
import { ApiRequestError } from '@/lib/api/types';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const data = await toggleWalletRule(id, body?.isActive);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to toggle wallet rule' }, { status: 500 });
  }
}
