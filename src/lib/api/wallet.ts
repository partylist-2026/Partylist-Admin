import { adminFetch } from '@/lib/api/client';
import type {
  WalletAdjustInput,
  CommissionConfig,
  EscrowOverview,
  WalletRuleList,
  WalletRuleMutationInput,
  WalletSummary,
  WalletTransactionList,
  WalletTransactionParams,
} from '@/lib/api/wallet.types';

function toQuery(params: WalletTransactionParams): string {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.userId) query.set('userId', params.userId);
  if (params.type) query.set('type', params.type);
  if (params.source) query.set('source', params.source);
  if (params.fromDate) query.set('fromDate', params.fromDate);
  if (params.toDate) query.set('toDate', params.toDate);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const text = query.toString();
  return text ? `?${text}` : '';
}

export async function getWalletSummary(): Promise<WalletSummary> {
  return adminFetch<WalletSummary>('/admin/wallet/summary');
}

export async function getEscrowOverview(): Promise<EscrowOverview> {
  return adminFetch<EscrowOverview>('/admin/finance/escrow');
}

export async function getWalletTransactions(
  params: WalletTransactionParams = {}
): Promise<WalletTransactionList> {
  return adminFetch<WalletTransactionList>(
    `/admin/wallet/transactions${toQuery({ page: 1, limit: 20, ...params })}`
  );
}

export async function adjustWalletBalance(input: WalletAdjustInput) {
  return adminFetch<{
    id: string;
    userId: string;
    type: string;
    amount: number;
    reason: string | null;
    createdAt: string;
  }>('/admin/wallet/adjust', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function reverseWalletTransaction(transactionId: string) {
  return adminFetch<{
    id: string;
    userId: string;
    type: string;
    amount: number;
    reversedFromId: string;
    createdAt: string;
  }>(`/admin/wallet/reverse/${transactionId}`, {
    method: 'POST',
  });
}

export async function getWalletRules(params: { page?: number; limit?: number; isActive?: boolean } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (typeof params.isActive === 'boolean') query.set('isActive', String(params.isActive));
  return adminFetch<WalletRuleList>(`/admin/wallet-rules${query.toString() ? `?${query.toString()}` : ''}`);
}

export async function createWalletRule(input: WalletRuleMutationInput) {
  return adminFetch('/admin/wallet-rules', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateWalletRule(ruleId: string, input: Partial<WalletRuleMutationInput>) {
  return adminFetch(`/admin/wallet-rules/${ruleId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function toggleWalletRule(ruleId: string, isActive?: boolean) {
  return adminFetch(`/admin/wallet-rules/${ruleId}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify(isActive == null ? {} : { isActive }),
  });
}

export async function getCommissionConfig(): Promise<CommissionConfig> {
  return adminFetch<CommissionConfig>('/admin/system/commission');
}

export async function updateCommissionConfig(input: CommissionConfig): Promise<CommissionConfig> {
  return adminFetch<CommissionConfig>('/admin/system/commission', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
