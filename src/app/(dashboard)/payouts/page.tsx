import type { Metadata } from 'next';
import { getPayoutDashboard } from '@/lib/api/payouts';
import type { PayoutDashboard } from '@/lib/api/payouts.types';
import { PayoutManagementView } from '@/components/payouts/payout-management-view';

export const metadata: Metadata = {
  title: 'Payout Management',
};

interface PayoutsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

const emptyDashboard: PayoutDashboard = {
  kpis: {
    totalEscrowBalance: 0,
    vendorPendingBalances: 0,
    payoutsCompleted24h: 0,
    payoutsCompleted24hCount: 0,
    onHoldAmount: 0,
    onHoldCount: 0,
    pendingPayoutCount: 0,
  },
  eligibilityOverview: { eligible: 0, cooldown: 0, underReview: 0, blocked: 0 },
  alerts: [],
  vendorQueue: [],
  readyBatchPayoutIds: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  refreshedAt: new Date().toISOString(),
};

export default async function PayoutsPage({ searchParams }: PayoutsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const search = params.search?.trim() ?? '';

  let loadError: string | null = null;
  let dashboard = emptyDashboard;

  try {
    dashboard = await getPayoutDashboard({ page, limit: 10, search: search || undefined });
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : 'Could not load payout data from the API. Is the backend running on port 3002?';
  }

  return (
    <PayoutManagementView
      initial={dashboard}
      initialSearch={search}
      initialPage={page}
      initialLoadError={loadError}
    />
  );
}
