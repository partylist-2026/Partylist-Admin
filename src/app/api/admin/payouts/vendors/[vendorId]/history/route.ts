import { NextResponse } from 'next/server';
import { getVendorPayouts } from '@/lib/api/payouts';
import { ApiRequestError } from '@/lib/api/types';

export async function GET(
  request: Request,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await context.params;
    const { searchParams } = new URL(request.url);
    const data = await getVendorPayouts(vendorId, {
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 20),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to load payout history' }, { status: 500 });
  }
}
