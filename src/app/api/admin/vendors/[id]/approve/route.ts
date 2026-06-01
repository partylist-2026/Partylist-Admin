import { NextResponse } from 'next/server';
import { approveVendor } from '@/lib/api/vendors';
import { ApiRequestError } from '@/lib/api/types';

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await approveVendor(id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to approve vendor' }, { status: 500 });
  }
}
