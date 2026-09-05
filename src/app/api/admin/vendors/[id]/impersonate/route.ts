import { NextResponse } from 'next/server';
import { impersonateVendor } from '@/lib/api/vendors';
import { ApiRequestError } from '@/lib/api/types';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { reason?: string };
    const reason = body.reason?.trim();
    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const data = await impersonateVendor(id, reason);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to start vendor view session' }, { status: 500 });
  }
}
