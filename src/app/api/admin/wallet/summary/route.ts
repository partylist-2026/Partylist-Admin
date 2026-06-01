import { NextResponse } from 'next/server';
import { getWalletSummary } from '@/lib/api/wallet';
import { ApiRequestError } from '@/lib/api/types';

export async function GET() {
  try {
    const data = await getWalletSummary();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to load wallet summary' }, { status: 500 });
  }
}
