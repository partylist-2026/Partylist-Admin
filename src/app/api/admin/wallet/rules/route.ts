import { NextResponse } from 'next/server';
import { createWalletRule, getWalletRules } from '@/lib/api/wallet';
import { ApiRequestError } from '@/lib/api/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getWalletRules({
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 10),
      isActive:
        searchParams.get('isActive') == null
          ? undefined
          : searchParams.get('isActive') === 'true',
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to load wallet rules' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await createWalletRule(body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to create wallet rule' }, { status: 500 });
  }
}
