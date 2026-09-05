import { NextResponse } from 'next/server';
import { listUsers } from '@/lib/api/users';
import { ApiRequestError } from '@/lib/api/types';
import type { ListUsersParams } from '@/lib/api/users.types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await listUsers({
      page: Number(searchParams.get('page') ?? 1),
      limit: Number(searchParams.get('limit') ?? 20),
      search: searchParams.get('search') ?? undefined,
      status: (searchParams.get('status') as ListUsersParams['status']) ?? undefined,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}
