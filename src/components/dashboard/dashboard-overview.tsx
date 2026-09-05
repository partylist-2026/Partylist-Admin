import {
  DollarSign,
  ShoppingBag,
  Store,
  Users,
  TrendingUp,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import type { DashboardOverviewData } from '@/lib/api/analytics.types';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import { StatCard } from '@/components/dashboard/stat-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { OrderBreakdownCard } from '@/components/dashboard/order-breakdown-card';
import { TopVendorsTable } from '@/components/dashboard/top-vendors-table';
import { RiskPanel } from '@/components/dashboard/risk-panel';
import { Badge } from '@/components/ui/badge';

interface DashboardOverviewProps {
  data: DashboardOverviewData;
  adminEmail?: string | null;
}

export function DashboardOverview({ data, adminEmail }: DashboardOverviewProps) {
  const { overview, revenueTrend, orderTrends, topVendors, risk, errors } = data;

  const hasAnyData =
    overview !== null ||
    revenueTrend !== null ||
    orderTrends !== null ||
    topVendors.length > 0 ||
    risk !== null;

  return (
    <div className="dashboard-scroll space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {adminEmail && (
            <div className="mb-2">
              <Badge variant="outline">Signed in as {adminEmail}</Badge>
            </div>
          )}
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Platform overview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Metrics loaded from the Partylist admin analytics API.
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[var(--radius-xl)] border border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--warning)_8%,white)] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">Some metrics could not be loaded</p>
            <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!hasAnyData && errors.length > 0 && (
        <EmptyPanel title="No analytics data available from the backend." />
      )}

      {overview && (
        <div className="metrics-grid">
          <StatCard
            title="Gross revenue"
            value={formatCurrency(overview.grossRevenue)}
            subtitle={`Net ${formatCurrency(overview.netRevenue)}`}
            detail={`Commission ${formatCurrency(overview.platformCommission)}`}
            icon={DollarSign}
          />
          <StatCard
            title="Net revenue"
            value={formatCurrency(overview.netRevenue)}
            subtitle={`Gross ${formatCurrency(overview.grossRevenue)}`}
            detail={`Refunds ${formatCurrency(overview.totalRefundAmount)}`}
            icon={TrendingUp}
          />
          <StatCard
            title="Total orders"
            value={formatNumber(overview.totalOrders)}
            subtitle={`${formatNumber(overview.completedOrders)} completed`}
            detail={
              overview.totalOrders > 0
                ? `${formatPercent(overview.completedOrders / overview.totalOrders)} completion rate`
                : undefined
            }
            icon={ShoppingBag}
          />
          <StatCard
            title="Active vendors"
            value={formatNumber(overview.activeVendors)}
            subtitle={`${formatNumber(overview.totalVendors)} total`}
            detail={
              overview.totalVendors > 0
                ? `${formatPercent(overview.activeVendors / overview.totalVendors)} active rate`
                : undefined
            }
            icon={Store}
          />
          <StatCard
            title="Platform users"
            value={formatNumber(overview.totalUsers)}
            subtitle={`Wallet credits ${formatCurrency(overview.walletCreditsIssued)}`}
            detail={`Wallet debits ${formatCurrency(overview.walletDebitsIssued)}`}
            icon={Users}
            iconClassName="bg-[color-mix(in_srgb,var(--primary)_12%,white)] text-primary"
          />
        </div>
      )}

      {(revenueTrend || overview || orderTrends) && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {revenueTrend ? (
              <RevenueChart data={revenueTrend} />
            ) : (
              <EmptyPanel title="Revenue trend data not returned by the API." />
            )}
          </div>
          <div className="space-y-4">
            {overview && <WalletActivity overview={overview} />}
            {orderTrends && (
              <MiniMetric
                icon={TrendingUp}
                label="Avg order value"
                value={formatCurrency(orderTrends.avgOrderValue)}
              />
            )}
          </div>
        </div>
      )}

      {(topVendors.length > 0 || orderTrends || risk) && (
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            {topVendors.length > 0 ? (
              <TopVendorsTable vendors={topVendors} />
            ) : (
              <EmptyPanel title="No vendor performance records returned by the API." />
            )}
          </div>
          <div className="space-y-4">
            {orderTrends ? (
              <OrderBreakdownCard data={orderTrends} />
            ) : (
              <EmptyPanel title="Order trend data not returned by the API." />
            )}
            {risk && <RiskPanel risk={risk} />}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyPanel({ title }: { title: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-border bg-card px-6 text-center text-sm text-muted-foreground">
      {title}
    </div>
  );
}

function WalletActivity({
  overview,
}: {
  overview: NonNullable<DashboardOverviewData['overview']>;
}) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(11,19,32,0.04)]">
      <div className="mb-3 flex items-center gap-2">
        <Wallet className="h-4 w-4 text-primary" aria-hidden />
        <p className="text-sm font-semibold text-foreground">Wallet activity</p>
      </div>
      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Credits issued</dt>
          <dd className="font-medium">{formatCurrency(overview.walletCreditsIssued)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Debits issued</dt>
          <dd className="font-medium">{formatCurrency(overview.walletDebitsIssued)}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <dt className="text-muted-foreground">Net revenue</dt>
          <dd className="font-semibold text-foreground">{formatCurrency(overview.netRevenue)}</dd>
        </div>
      </dl>
    </div>
  );
}

function MiniMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(11,19,32,0.04)]">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
