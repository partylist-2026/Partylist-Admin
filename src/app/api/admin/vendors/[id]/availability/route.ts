import { NextResponse } from 'next/server';
import { updateVendorAvailability } from '@/lib/api/vendors';
import { ApiRequestError } from '@/lib/api/types';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { isAvailable?: boolean };
    const data = await updateVendorAvailability(id, body.isAvailable === true);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}
