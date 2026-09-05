import { adminFetch } from '@/lib/api/client';
import type {
  AdminAnalyticsOrderTrends,
  AdminAnalyticsOverview,
  AdminAnalyticsRevenueTrend,
  AdminAnalyticsRisk,
  AdminAnalyticsVendorPerformance,
  DashboardOverviewData,
} from '@/lib/api/analytics.types';

export async function getAnalyticsOverview(
  params?: { fromDate?: string; toDate?: string }
): Promise<AdminAnalyticsOverview> {
  const search = new URLSearchParams();
  if (params?.fromDate) search.set('fromDate', params.fromDate);
  if (params?.toDate) search.set('toDate', params.toDate);
  const qs = search.toString();
  return adminFetch<AdminAnalyticsOverview>(
    `/admin/analytics/overview${qs ? `?${qs}` : ''}`
  );
}

export async function getRevenueTrend(
  params?: { period?: 'daily' | 'weekly' | 'monthly'; fromDate?: string; toDate?: string }
): Promise<AdminAnalyticsRevenueTrend> {
  const search = new URLSearchParams();
  if (params?.period) search.set('period', params.period);
  if (params?.fromDate) search.set('fromDate', params.fromDate);
  if (params?.toDate) search.set('toDate', params.toDate);
  const qs = search.toString();
  return adminFetch<AdminAnalyticsRevenueTrend>(
    `/admin/analytics/revenue-trend${qs ? `?${qs}` : ''}`
  );
}

export async function getOrderTrends(): Promise<AdminAnalyticsOrderTrends> {
  return adminFetch<AdminAnalyticsOrderTrends>('/admin/analytics/order-trends');
}

export async function getTopVendors(
  limit = 5
): Promise<AdminAnalyticsVendorPerformance[]> {
  return adminFetch<AdminAnalyticsVendorPerformance[]>(
    `/admin/analytics/vendors?page=1&limit=${limit}&sortBy=revenue`
  );
}

export async function getRiskIndicators(): Promise<AdminAnalyticsRisk> {
  return adminFetch<AdminAnalyticsRisk>('/admin/analytics/risk');
}

export async function getDashboardOverviewData(): Promise<DashboardOverviewData> {
  const errors: string[] = [];

  const [overview, revenueTrend, orderTrends, topVendors, risk] =
    await Promise.allSettled([
      getAnalyticsOverview(),
      getRevenueTrend({ period: 'daily' }),
      getOrderTrends(),
      getTopVendors(5),
      getRiskIndicators(),
    ]);

  const unwrap = <T,>(result: PromiseSettledResult<T>, label: string): T | null => {
    if (result.status === 'fulfilled') return result.value;
    const reason = result.reason as { message?: string } | undefined;
    errors.push(`${label}: ${reason?.message ?? 'Failed to load'}`);
    return null;
  };

  return {
    overview: unwrap(overview, 'Overview'),
    revenueTrend: unwrap(revenueTrend, 'Revenue trend'),
    orderTrends: unwrap(orderTrends, 'Order trends'),
    topVendors: topVendors.status === 'fulfilled' ? topVendors.value : [],
    risk: unwrap(risk, 'Risk indicators'),
    errors,
  };
}
