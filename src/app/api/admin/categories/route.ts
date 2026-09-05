import { NextResponse } from 'next/server';
import { listCategories } from '@/lib/api/categories';
import { ApiRequestError } from '@/lib/api/types';

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}
