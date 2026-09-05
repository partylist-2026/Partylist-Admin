import { NextResponse } from 'next/server';
import { getEscrowOverview } from '@/lib/api/wallet';
import { ApiRequestError } from '@/lib/api/types';

export async function GET() {
  try {
    const data = await getEscrowOverview();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to load escrow overview' }, { status: 500 });
  }
}
