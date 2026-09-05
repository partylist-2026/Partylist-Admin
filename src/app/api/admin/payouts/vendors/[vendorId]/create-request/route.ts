import { NextResponse } from 'next/server';
import { createVendorPayoutRequest } from '@/lib/api/payouts';
import { ApiRequestError } from '@/lib/api/types';

export async function POST(
  request: Request,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { amount?: number };
    const data = await createVendorPayoutRequest(vendorId, body.amount);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to create payout request' }, { status: 500 });
  }
}
