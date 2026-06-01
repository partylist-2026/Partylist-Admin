import { NextResponse } from 'next/server';
import { reverseWalletTransaction } from '@/lib/api/wallet';
import { ApiRequestError } from '@/lib/api/types';

export async function POST(
  _: Request,
  context: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await context.params;
    const data = await reverseWalletTransaction(transactionId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to reverse transaction' }, { status: 500 });
  }
}
