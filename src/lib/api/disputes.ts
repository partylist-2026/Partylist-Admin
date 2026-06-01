import { adminFetch } from '@/lib/api/client';
import type {
  ConfirmRefundInput,
  DisputeDashboardData,
  DisputeDashboardParams,
  DisputeDetail,
  ResolveDisputeInput,
} from '@/lib/api/disputes.types';

function queryFromParams(params: DisputeDashboardParams): string {
  const search = new URLSearchParams();
  if (params.tab) search.set('tab', params.tab);
  if (params.search) search.set('search', params.search);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function getDisputesDashboard(
  params: DisputeDashboardParams = {}
): Promise<DisputeDashboardData> {
  return adminFetch<DisputeDashboardData>(
    `/admin/disputes/dashboard${queryFromParams({
      tab: 'ACTION_REQUIRED',
      page: 1,
      limit: 12,
      ...params,
    })}`
  );
}

export async function getDisputeDetail(disputeId: string): Promise<DisputeDetail> {
  return adminFetch<DisputeDetail>(`/admin/disputes/${disputeId}`);
}

export async function reviewDispute(disputeId: string) {
  return adminFetch<{ disputeId: string; status: string }>(`/admin/disputes/${disputeId}/review`, {
    method: 'PATCH',
  });
}

export async function resolveDispute(disputeId: string, payload: ResolveDisputeInput) {
  return adminFetch<{ disputeId: string; status: string; orderStatus: string }>(
    `/admin/disputes/${disputeId}/resolve`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

export async function confirmDisputeRefund(disputeId: string, payload: ConfirmRefundInput) {
  return adminFetch<{ orderId: string; status: string; paymentStatus: string }>(
    `/admin/disputes/${disputeId}/confirm-refund`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}
