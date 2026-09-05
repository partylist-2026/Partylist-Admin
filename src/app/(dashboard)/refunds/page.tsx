import type { Metadata } from 'next';
import { getDisputesDashboard } from '@/lib/api/disputes';
import type { DisputeDashboardData, DisputeDashboardTab } from '@/lib/api/disputes.types';
import { RefundsDisputesView } from '@/components/refunds/refunds-disputes-view';

export const metadata: Metadata = {
  title: 'Refunds & Disputes',
};

interface RefundsPageProps {
  searchParams: Promise<{
    tab?: DisputeDashboardTab;
    search?: string;
    page?: string;
  }>;
}

const EMPTY_DASHBOARD: DisputeDashboardData = {
  kpis: {
    openDisputes: 0,
    pendingRefunds: 0,
    avgResolutionTimeHours: 0,
    amountRefunded30d: 0,
  },
  cases: [],
  statusBreakdown: {
    open: 0,
    inReview: 0,
    resolved: 0,
    closed: 0,
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  },
  activeTab: 'ACTION_REQUIRED',
  search: '',
  refreshedAt: new Date().toISOString(),
};

export default async function RefundsPage({ searchParams }: RefundsPageProps) {
  const params = await searchParams;
  const tab: DisputeDashboardTab = params.tab ?? 'ACTION_REQUIRED';
  const page = Math.max(1, Number(params.page ?? 1));
  const search = params.search?.trim() ?? '';

  let loadError: string | null = null;
  let dashboard = EMPTY_DASHBOARD;

  try {
    dashboard = await getDisputesDashboard({
      tab,
      page,
      limit: 12,
      search: search || undefined,
    });
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : 'Could not load disputes dashboard from API. Ensure backend is running on port 3002.';
  }

  return (
    <RefundsDisputesView
      initial={dashboard}
      initialTab={tab}
      initialPage={page}
      initialSearch={search}
      initialLoadError={loadError}
    />
  );
}
