import { NextResponse } from 'next/server';
import { createVendor } from '@/lib/api/vendors';
import { ApiRequestError } from '@/lib/api/types';
import type { CreateVendorInput } from '@/lib/api/vendors.types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateVendorInput;
    const data = await createVendor(body);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}
