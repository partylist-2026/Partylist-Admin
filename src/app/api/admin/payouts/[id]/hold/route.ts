import { NextResponse } from 'next/server';
import { holdPayout } from '@/lib/api/payouts';
import { ApiRequestError } from '@/lib/api/types';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { reason: string };
    const data = await holdPayout(id, body.reason);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to hold payout' }, { status: 500 });
  }
}
