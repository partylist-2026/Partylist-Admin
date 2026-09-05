import { NextResponse } from 'next/server';
import { getWalletTransactions } from '@/lib/api/wallet';
import { ApiRequestError } from '@/lib/api/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getWalletTransactions({
      search: searchParams.get('search') ?? undefined,
      userId: searchParams.get('userId') ?? undefined,
      type: (searchParams.get('type') as 'CREDIT' | 'DEBIT' | null) ?? undefined,
      source: searchParams.get('source') ?? undefined,
      fromDate: searchParams.get('fromDate') ?? undefined,
      toDate: searchParams.get('toDate') ?? undefined,
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 20),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to load wallet transactions' }, { status: 500 });
  }
}
