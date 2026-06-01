import { NextResponse } from 'next/server';
import { suspendVendor } from '@/lib/api/vendors';
import { ApiRequestError } from '@/lib/api/types';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { reason?: string };
    const data = await suspendVendor(
      id,
      body.reason ?? 'Suspended by admin'
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to suspend vendor' }, { status: 500 });
  }
}
