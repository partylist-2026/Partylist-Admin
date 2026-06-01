import { NextResponse } from 'next/server';
import { getPayoutDashboard } from '@/lib/api/payouts';
import { ApiRequestError } from '@/lib/api/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getPayoutDashboard({
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 10),
      search: searchParams.get('search') ?? undefined,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof ApiRequestError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Failed to load payout dashboard';
    console.error('[payouts/dashboard]', message);
    const status = error instanceof ApiRequestError ? error.status : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
