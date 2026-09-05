import { NextResponse } from 'next/server';
import { batchReleasePayouts } from '@/lib/api/payouts';
import { ApiRequestError } from '@/lib/api/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { payoutIds: string[] };
    const data = await batchReleasePayouts(body.payoutIds ?? []);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Batch release failed' }, { status: 500 });
  }
}
