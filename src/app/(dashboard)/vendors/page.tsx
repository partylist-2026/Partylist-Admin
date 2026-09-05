import type { Metadata } from 'next';
import { AlertCircle, Ban, CheckCircle2, Clock, Store } from 'lucide-react';
import { getVendorStats, listVendors } from '@/lib/api/vendors';
import { getTopVendors } from '@/lib/api/analytics';
import type { VendorStatus } from '@/lib/api/vendors.types';
import { formatNumber, formatPercent } from '@/lib/format';
import { VendorMetricCard } from '@/components/vendors/vendor-metric-card';
import { VendorPerformanceChart } from '@/components/vendors/vendor-performance-chart';
import { VendorPendingQueue } from '@/components/vendors/vendor-pending-queue';
import { VendorsTable } from '@/components/vendors/vendors-table';
import { VendorsPageHeaderWithAdd } from '@/components/vendors/vendors-page-header-with-add';

export const metadata: Metadata = {
  title: 'Vendors',
};

interface VendorsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: VendorStatus;
  }>;
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const search = params.search?.trim() ?? '';
  const status = params.status ?? '';

  const [stats, vendorList, pendingQueue, topPerformers] = await Promise.allSettled([
    getVendorStats(),
    listVendors({
      page,
      limit: 10,
      search: search || undefined,
      status: status || undefined,
    }),
    listVendors({ page: 1, limit: 4, status: 'UNDER_REVIEW' }),
    getTopVendors(5),
  ]);

  const statsData = stats.status === 'fulfilled' ? stats.value : null;
  const listData =
    vendorList.status === 'fulfilled'
      ? vendorList.value
      : { vendors: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
  const pendingData =
    pendingQueue.status === 'fulfilled' ? pendingQueue.value.vendors : [];
  const performers =
    topPerformers.status === 'fulfilled' ? topPerformers.value : [];

  const loadErrors: string[] = [];
  if (stats.status === 'rejected') loadErrors.push('Vendor stats');
  if (vendorList.status === 'rejected') loadErrors.push('Vendor list');
  if (pendingQueue.status === 'rejected') loadErrors.push('Pending queue');
  if (topPerformers.status === 'rejected') loadErrors.push('Performance analytics');

  const approvedShare =
    statsData && statsData.total > 0
      ? statsData.approved / statsData.total
      : 0;
  const suspendedShare =
    statsData && statsData.total > 0
      ? statsData.suspended / statsData.total
      : 0;

  return (
    <div className="dashboard-scroll space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <VendorsPageHeaderWithAdd statusFilter={status} />

      {loadErrors.length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--warning)_8%,white)] px-4 py-3"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning-foreground)]" aria-hidden />
          <p className="text-sm text-foreground">
            Could not load: {loadErrors.join(', ')}
          </p>
        </div>
      )}

      {statsData && (
        <div className="metrics-grid">
          <VendorMetricCard
            title="Total vendors"
            value={formatNumber(statsData.total)}
            icon={Store}
            iconWrapClassName="bg-secondary text-secondary-foreground"
          />
          <VendorMetricCard
            title="Pending approval"
            value={formatNumber(statsData.pendingApproval)}
            chip={
              statsData.pendingApproval > 0
                ? {
                    label: `${formatNumber(statsData.pendingApproval)} in queue`,
                    tone: 'warning',
                  }
                : undefined
            }
            icon={Clock}
            iconWrapClassName="bg-[var(--warning-soft)] text-[var(--warning-foreground)]"
          />
          <VendorMetricCard
            title="Approved vendors"
            value={formatNumber(statsData.approved)}
            chip={
              statsData.total > 0
                ? {
                    label: `${formatPercent(approvedShare)} of total`,
                    tone: 'success',
                  }
                : undefined
            }
            icon={CheckCircle2}
            iconWrapClassName="bg-[var(--success-soft)] text-[var(--success-foreground)]"
          />
          <VendorMetricCard
            title="Suspended vendors"
            value={formatNumber(statsData.suspended)}
            chip={
              statsData.total > 0 && statsData.suspended > 0
                ? {
                    label: `${formatPercent(suspendedShare)} of total`,
                    tone: 'destructive',
                  }
                : undefined
            }
            icon={Ban}
            iconWrapClassName="bg-[var(--destructive-soft)] text-[var(--destructive-foreground)]"
          />
        </div>
      )}

      <div className="vendors-insights-grid">
        <VendorPerformanceChart vendors={performers} />
        <VendorPendingQueue vendors={pendingData} />
      </div>

      <VendorsTable
        vendors={listData.vendors}
        pagination={listData.pagination}
        initialSearch={search}
        initialStatus={status}
      />
    </div>
  );
}
