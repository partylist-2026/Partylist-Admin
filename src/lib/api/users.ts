import { adminFetch } from '@/lib/api/client';
import type {
  AdminUserDetail,
  AdminUserListResponse,
  ListUsersParams,
} from '@/lib/api/users.types';

function buildQuery(params: ListUsersParams): string {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.search) search.set('search', params.search);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function listUsers(
  params: ListUsersParams = {}
): Promise<AdminUserListResponse> {
  return adminFetch<AdminUserListResponse>(
    `/admin/users${buildQuery({ page: 1, limit: 20, ...params })}`
  );
}

export async function getUserDetail(userId: string): Promise<AdminUserDetail> {
  return adminFetch<AdminUserDetail>(`/admin/users/${userId}`);
}
