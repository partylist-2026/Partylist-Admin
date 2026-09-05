import { adminFetch } from '@/lib/api/client';
import type {
  BatchReleaseResult,
  PayoutDashboard,
  PayoutDashboardParams,
  ReleasePayoutInput,
  VendorPayoutListResponse,
} from '@/lib/api/payouts.types';

function buildQuery(params: PayoutDashboardParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.search) search.set('search', params.search);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function getPayoutDashboard(
  params: PayoutDashboardParams = {}
): Promise<PayoutDashboard> {
  return adminFetch<PayoutDashboard>(
    `/admin/payout-engine/dashboard${buildQuery({ page: 1, limit: 10, ...params })}`
  );
}

export async function releasePayout(payoutId: string, input: ReleasePayoutInput) {
  return adminFetch(`/admin/payout-engine/${payoutId}/release`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getVendorPayouts(
  vendorId: string,
  params: { page?: number; limit?: number } = {}
) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  return adminFetch<VendorPayoutListResponse>(
    `/admin/payout-engine/vendors/${vendorId}/payouts${qs ? `?${qs}` : ''}`
  );
}

export async function holdPayout(payoutId: string, reason: string) {
  return adminFetch(`/admin/payout-engine/${payoutId}/hold`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function batchReleasePayouts(payoutIds: string[]) {
  return adminFetch<BatchReleaseResult>('/admin/payout-engine/batch-release', {
    method: 'POST',
    body: JSON.stringify({ payoutIds }),
  });
}

export async function createVendorPayoutRequest(vendorId: string, amount?: number) {
  return adminFetch<{ payoutId: string; amount: number; status: string }>(
    `/admin/payout-engine/vendors/${vendorId}/create-request`,
    {
      method: 'POST',
      body: JSON.stringify(amount != null ? { amount } : {}),
    }
  );
}
