import { NextResponse } from 'next/server';
import { confirmDisputeRefund } from '@/lib/api/disputes';
import { ApiRequestError } from '@/lib/api/types';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await confirmDisputeRefund(id, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to confirm refund for dispute' },
      { status: 500 }
    );
  }
}
