import { NextResponse } from 'next/server';
import { getCommissionConfig, updateCommissionConfig } from '@/lib/api/wallet';
import { ApiRequestError } from '@/lib/api/types';

export async function GET() {
  try {
    const data = await getCommissionConfig();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to load commission config' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const data = await updateCommissionConfig(body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to update commission config' }, { status: 500 });
  }
}
