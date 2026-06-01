import { adminFetch } from '@/lib/api/client';
import type {
  AdminVendorDetail,
  AdminVendorListResponse,
  CreateVendorInput,
  CreateVendorResponse,
  ListVendorsParams,
  VendorImpersonationResponse,
  VendorStats,
} from '@/lib/api/vendors.types';

function buildQuery(params: ListVendorsParams): string {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.kycStatus) search.set('kycStatus', params.kycStatus);
  if (params.search) search.set('search', params.search);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function listVendors(
  params: ListVendorsParams = {}
): Promise<AdminVendorListResponse> {
  return adminFetch<AdminVendorListResponse>(
    `/admin/vendors${buildQuery({ page: 1, limit: 20, ...params })}`
  );
}

export async function getVendorStats(): Promise<VendorStats> {
  const [all, pending, approved, suspended] = await Promise.all([
    listVendors({ page: 1, limit: 1 }),
    listVendors({ page: 1, limit: 1, status: 'UNDER_REVIEW' }),
    listVendors({ page: 1, limit: 1, status: 'APPROVED' }),
    listVendors({ page: 1, limit: 1, status: 'SUSPENDED' }),
  ]);

  return {
    total: all.pagination.total,
    pendingApproval: pending.pagination.total,
    approved: approved.pagination.total,
    suspended: suspended.pagination.total,
  };
}

export async function approveVendor(vendorId: string) {
  return adminFetch<{ vendorId: string; status: string }>(
    `/admin/vendors/${vendorId}/approve`,
    { method: 'PATCH' }
  );
}

export async function suspendVendor(vendorId: string, reason: string) {
  return adminFetch<{ vendorId: string; status: string }>(
    `/admin/vendors/${vendorId}/suspend`,
    {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }
  );
}

export async function reactivateVendor(vendorId: string) {
  return adminFetch<{ vendorId: string; status: string }>(
    `/admin/vendors/${vendorId}/reactivate`,
    { method: 'PATCH' }
  );
}

export async function getVendorDetail(vendorId: string) {
  return adminFetch<AdminVendorDetail>(`/admin/vendors/${vendorId}`);
}

export async function createVendor(input: CreateVendorInput) {
  return adminFetch<CreateVendorResponse>('/admin/vendors', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateVendorAvailability(vendorId: string, isAvailable: boolean) {
  return adminFetch<{ vendorId: string; isAvailable: boolean }>(
    `/admin/vendors/${vendorId}/availability`,
    {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    }
  );
}

export async function impersonateVendor(vendorId: string, reason: string) {
  return adminFetch<VendorImpersonationResponse>(
    `/admin/vendors/${vendorId}/impersonate`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }
  );
}
