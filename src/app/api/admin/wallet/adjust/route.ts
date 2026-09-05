import { NextResponse } from 'next/server';
import { adjustWalletBalance } from '@/lib/api/wallet';
import { ApiRequestError } from '@/lib/api/types';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = await adjustWalletBalance(payload);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to adjust wallet balance' }, { status: 500 });
  }
}
