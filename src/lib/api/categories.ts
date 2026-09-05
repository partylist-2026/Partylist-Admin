import { adminFetch } from '@/lib/api/client';

export interface AdminCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export async function listCategories(): Promise<AdminCategory[]> {
  const data = await adminFetch<{ categories: AdminCategory[] }>(
    '/admin/categories?limit=100&isActive=true'
  );
  return data.categories;
}
