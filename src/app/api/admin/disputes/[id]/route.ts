import { NextResponse } from 'next/server';
import { getDisputeDetail } from '@/lib/api/disputes';
import { ApiRequestError } from '@/lib/api/types';

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await getDisputeDetail(id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to load dispute' }, { status: 500 });
  }
}
