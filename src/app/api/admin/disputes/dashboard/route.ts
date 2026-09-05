import { NextResponse } from 'next/server';
import { getDisputesDashboard } from '@/lib/api/disputes';
import { ApiRequestError } from '@/lib/api/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getDisputesDashboard({
      tab: (searchParams.get('tab') as
        | 'ACTION_REQUIRED'
        | 'UNDER_REVIEW'
        | 'RESOLVED'
        | 'ALL'
        | null) ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 12),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof ApiRequestError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Failed to load disputes dashboard';
    const status = error instanceof ApiRequestError ? error.status : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
