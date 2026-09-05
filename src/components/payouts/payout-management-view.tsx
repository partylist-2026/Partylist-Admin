'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowDownToLine,
  Ban,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Lock,
  Search,
  Wallet,
} from 'lucide-react';
import type {
  PayoutDashboard,
  PayoutDashboardQueueItem,
  VendorDisputeState,
  VendorPayoutEligibility,
} from '@/lib/api/payouts.types';
import { PayoutRowActionsMenu } from '@/components/payouts/payout-row-actions-menu';
import { PayoutReleaseDialog } from '@/components/payouts/payout-release-dialog';
import { VendorPayoutHistoryDialog } from '@/components/payouts/vendor-payout-history-dialog';
import { formatCurrency, formatDate, formatNumber, formatRelativeTime, getInitials } from '@/lib/format';
import { VendorMetricCard } from '@/components/vendors/vendor-metric-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const POLL_MS = 60_000;

const eligibilityClass: Record<VendorPayoutEligibility, string> = {
  ELIGIBLE: 'metric-chip metric-chip-success',
  COOLDOWN: 'metric-chip metric-chip-warning',
  UNDER_REVIEW: 'metric-chip metric-chip-warning',
  BLOCKED: 'metric-chip metric-chip-destructive',
};

const eligibilityLabel: Record<VendorPayoutEligibility, string> = {
  ELIGIBLE: 'Eligible',
  COOLDOWN: 'On Cool-down',
  UNDER_REVIEW: 'Under Review',
  BLOCKED: 'Blocked',
};

function disputeStatusLabel(state: VendorDisputeState, openDisputeCount: number): string {
  if (state === 'OPEN') {
    return `Payment held: ${openDisputeCount} active dispute(s)`;
  }
  if (state === 'SORTED') {
    return 'Dispute: Sorted';
  }
  return 'Dispute: No disputes';
}

const alertToneClass = {
  warning: 'bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]',
  destructive: 'bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)] text-destructive',
  info: 'bg-secondary text-secondary-foreground',
  success: 'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]',
};

async function fetchDashboardApi(query: string): Promise<PayoutDashboard> {
  const res = await fetch(`/api/admin/payouts/dashboard?${query}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      'Payout API returned HTML instead of JSON. Use /api/admin/payouts/dashboard (not /payouts).'
    );
  }
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error ?? `Payout API failed (${res.status})`);
  }
  return body.data as PayoutDashboard;
}

interface PayoutManagementViewProps {
  initial: PayoutDashboard;
  initialSearch?: string;
  initialPage?: number;
  initialLoadError?: string | null;
}

export function PayoutManagementView({
  initial,
  initialSearch = '',
  initialLoadError = null,
}: PayoutManagementViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState(initialSearch);
  const [loadError, setLoadError] = useState<string | null>(initialLoadError);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyPayoutId, setBusyPayoutId] = useState<string | null>(null);
  const [releaseTarget, setReleaseTarget] = useState<{
    payoutId: string;
    vendorName: string;
    amount: number;
    warning?: string;
  } | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{
    vendorId: string;
    vendorName: string;
  } | null>(null);

  function openReleaseDialog(row: PayoutDashboardQueueItem) {
    if (!row.pendingPayoutId) return;
    setReleaseTarget({
      payoutId: row.pendingPayoutId,
      vendorName: row.storeName,
      amount: row.pendingPayoutAmount ?? row.pendingBalance,
      warning:
        !row.hasBankDetails
          ? 'Bank details are not on file for this vendor. Verify account information before paying.'
          : undefined,
    });
  }

  function openHistoryDialog(row: PayoutDashboardQueueItem) {
    setHistoryTarget({ vendorId: row.vendorId, vendorName: row.storeName });
  }

  const refresh = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('page')) params.set('page', '1');
    if (!params.has('limit')) params.set('limit', '10');
    try {
      const next = await fetchDashboardApi(params.toString());
      setData(next);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to refresh payout data');
    }
  }, []);

  useEffect(() => {
    setData(initial);
    setSearch(initialSearch);
    setLoadError(initialLoadError);
  }, [initial, initialSearch, initialLoadError]);

  useEffect(() => {
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  function updateQuery(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    if (updates.search !== undefined && !updates.page) params.set('page', '1');
    startTransition(() => {
      router.push(`/payouts?${params.toString()}`);
    });
  }

  async function runBatchRelease() {
    if (data.readyBatchPayoutIds.length === 0) return;
    setActionError(null);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/payouts/batch-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutIds: data.readyBatchPayoutIds.slice(0, 50) }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Batch release failed');
      setActionMessage(
        `Released ${body.data.successCount} payout(s)${
          body.data.failedCount ? `, ${body.data.failedCount} failed` : ''
        }.`
      );
      await refresh();
      router.refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Batch release failed');
    }
  }

  async function createRequest(vendorId: string, vendorName: string) {
    setBusyPayoutId(vendorId);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/payouts/vendors/${vendorId}/create-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Could not create payout request');
      setActionMessage(`Payout request created for ${vendorName} (${formatCurrency(body.data.amount)}).`);
      await refresh();
      router.refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not create payout request');
    } finally {
      setBusyPayoutId(null);
    }
  }

  async function holdOne(payoutId: string, vendorName: string) {
    const reason = window.prompt(`Hold reason for ${vendorName}:`, 'Manual review');
    if (!reason?.trim()) return;
    setBusyPayoutId(payoutId);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Hold failed');
      setActionMessage('Payout placed on hold.');
      await refresh();
      router.refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Hold failed');
    } finally {
      setBusyPayoutId(null);
    }
  }

  const chartMax = Math.max(
    1,
    data.eligibilityOverview.eligible,
    data.eligibilityOverview.cooldown,
    data.eligibilityOverview.underReview,
    data.eligibilityOverview.blocked
  );

  const chartBars = [
    { key: 'eligible', label: 'Eligible', value: data.eligibilityOverview.eligible, className: 'chart-bar-gradient' },
    {
      key: 'cooldown',
      label: 'Cool-down',
      value: data.eligibilityOverview.cooldown,
      className: 'bg-[var(--success)]',
    },
    {
      key: 'review',
      label: 'Under Review',
      value: data.eligibilityOverview.underReview,
      className: 'bg-[var(--warning)]',
    },
    {
      key: 'blocked',
      label: 'Blocked',
      value: data.eligibilityOverview.blocked,
      className: 'bg-destructive',
    },
  ];

  const page = data.pagination.page;
  const { total, totalPages, limit } = data.pagination;
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div className="dashboard-scroll space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Payout Management</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Monitor escrow balances, vendor eligibility, and release payouts. Data refreshes every minute.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Last updated {formatRelativeTime(data.refreshedAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-2" disabled>
            <Calendar className="h-4 w-4" aria-hidden />
            This Week
          </Button>
          <Button
            type="button"
            size="sm"
            className="btn-primary-gradient gap-2"
            disabled={data.readyBatchPayoutIds.length === 0 || isPending}
            title="Bulk release uses a batch reference. Prefer Record & release per vendor for full bank details."
            onClick={runBatchRelease}
          >
            <ArrowDownToLine className="h-4 w-4" aria-hidden />
            Bulk release (basic)
          </Button>
        </div>
      </div>

      {loadError && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--destructive)_30%,transparent)] bg-[var(--destructive-soft)] px-4 py-3 text-sm text-[var(--destructive-foreground)]"
        >
          <strong>Could not load payout data:</strong> {loadError}
          <span className="mt-1 block text-xs opacity-90">
            Data comes from Partylist API (<code className="text-xs">localhost:3002</code>
            ), not this HTML page. In Network, check{' '}
            <code className="text-xs">dashboard?page=1</code> — not the document named{' '}
            <code className="text-xs">payouts</code>.
          </span>
        </div>
      )}

      {(actionError || actionMessage) && (
        <div
          role="status"
          className={cn(
            'rounded-[var(--radius-md)] border px-4 py-3 text-sm',
            actionError
              ? 'border-[color-mix(in_srgb,var(--destructive)_30%,transparent)] bg-[var(--destructive-soft)] text-[var(--destructive-foreground)]'
              : 'border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[var(--success-soft)] text-[var(--success-foreground)]'
          )}
        >
          {actionError ?? actionMessage}
        </div>
      )}

      <div className={cn('metrics-grid', isPending && 'opacity-70')}>
        <VendorMetricCard
          title="Total Escrow Balance"
          value={formatCurrency(data.kpis.totalEscrowBalance)}
          chip={{ label: 'Live', tone: 'success' }}
          icon={Lock}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-primary"
        />
        <VendorMetricCard
          title="Vendor Pending Balances"
          value={formatCurrency(data.kpis.vendorPendingBalances)}
          chip={
            data.kpis.pendingPayoutCount > 0
              ? { label: `${data.kpis.pendingPayoutCount} pending`, tone: 'warning' }
              : undefined
          }
          icon={Wallet}
        />
        <VendorMetricCard
          title="Payouts Completed (24h)"
          value={formatCurrency(data.kpis.payoutsCompleted24h)}
          chip={
            data.kpis.payoutsCompleted24hCount > 0
              ? { label: `+${data.kpis.payoutsCompleted24hCount}`, tone: 'success' }
              : undefined
          }
          icon={ArrowDownToLine}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]"
        />
        <VendorMetricCard
          title="On-Hold Payouts"
          value={formatCurrency(data.kpis.onHoldAmount)}
          chip={
            data.kpis.onHoldCount > 0
              ? { label: `${data.kpis.onHoldCount} held`, tone: 'destructive' }
              : undefined
          }
          icon={Ban}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)] text-destructive"
        />
      </div>

      <div className="vendors-insights-grid">
        <section className="admin-panel-card p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">Payout Eligibility Overview</h2>
            <span className="text-xs text-muted-foreground">All vendors with balance</span>
          </div>
          <div className="flex h-44 items-end justify-between gap-3 border-b border-border pb-2">
            {chartBars.map((bar) => (
              <div key={bar.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-foreground">{bar.value}</span>
                <div
                  className={cn(
                    'w-full max-w-[3.5rem] rounded-t-[var(--radius-sm)] transition-all',
                    bar.className
                  )}
                  style={{ height: `${Math.max(12, (bar.value / chartMax) * 120)}px` }}
                />
                <span className="text-center text-[11px] text-muted-foreground">{bar.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel-card overflow-hidden">
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold text-foreground">Payout Alerts</h2>
          </header>
          <ul className="max-h-52 divide-y divide-border overflow-y-auto">
            {data.alerts.length === 0 ? (
              <li className="px-4 py-6 text-center text-xs text-muted-foreground">No alerts.</li>
            ) : (
              data.alerts.map((alert) => (
                <li key={alert.id} className="flex gap-3 px-4 py-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)]',
                      alertToneClass[alert.tone]
                    )}
                  >
                    <AlertCircle className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatRelativeTime(alert.createdAt)}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="admin-panel-card overflow-hidden">
        <header className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Vendor Payout Queue</h2>
            <p className="text-xs text-muted-foreground">Release or hold vendor payouts</p>
          </div>
          <form
            className="relative w-full sm:max-w-xs"
            onSubmit={(e) => {
              e.preventDefault();
              updateQuery({ search: search.trim() || undefined });
            }}
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors..."
              className="h-9 pl-9"
              aria-label="Search vendors"
            />
          </form>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Vendor</th>
                <th className="px-3 py-3 text-right">Pending Balance</th>
                <th className="px-3 py-3">Eligibility</th>
                <th className="px-3 py-3">Last Payout</th>
                <th className="px-3 py-3">Risk &amp; KYC</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.vendorQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    No vendors with pending balances match your filters.
                  </td>
                </tr>
              ) : (
                data.vendorQueue.map((row) => (
                  <QueueRow
                    key={row.vendorId}
                    row={row}
                    busy={
                      busyPayoutId === row.vendorId ||
                      (row.pendingPayoutId != null && busyPayoutId === row.pendingPayoutId)
                    }
                    onRelease={() => openReleaseDialog(row)}
                    onViewHistory={() => openHistoryDialog(row)}
                    onHold={() => row.pendingPayoutId && holdOne(row.pendingPayoutId, row.storeName)}
                    onCreateRequest={() => createRequest(row.vendorId, row.storeName)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-muted-foreground">
            Showing {rangeStart} to {rangeEnd} of {formatNumber(total)} vendors with pending balances
          </p>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1 || isPending}
              onClick={() => updateQuery({ page: String(page - 1) })}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages || isPending}
              onClick={() => updateQuery({ page: String(page + 1) })}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </footer>
      </section>

      {releaseTarget && (
        <PayoutReleaseDialog
          open
          onOpenChange={(open) => !open && setReleaseTarget(null)}
          vendorName={releaseTarget.vendorName}
          amount={releaseTarget.amount}
          payoutId={releaseTarget.payoutId}
          warning={releaseTarget.warning}
          onSuccess={() => {
            setActionMessage(`Payout recorded and released for ${releaseTarget.vendorName}.`);
            setReleaseTarget(null);
            void refresh();
            router.refresh();
          }}
        />
      )}

      {historyTarget && (
        <VendorPayoutHistoryDialog
          open
          onOpenChange={(open) => !open && setHistoryTarget(null)}
          vendorId={historyTarget.vendorId}
          vendorName={historyTarget.vendorName}
        />
      )}

      {data.readyBatchPayoutIds.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 flex max-w-sm items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card px-4 py-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">
            {data.readyBatchPayoutIds.length} payout batch
            {data.readyBatchPayoutIds.length === 1 ? '' : 'es'} ready
          </p>
          <Button type="button" size="sm" className="btn-primary-gradient shrink-0" onClick={runBatchRelease}>
            Review Batches
          </Button>
        </div>
      )}
    </div>
  );
}

function QueueRow({
  row,
  busy,
  onRelease,
  onViewHistory,
  onHold,
  onCreateRequest,
}: {
  row: PayoutDashboardQueueItem;
  busy: boolean;
  onRelease: () => void;
  onViewHistory: () => void;
  onHold: () => void;
  onCreateRequest: () => void;
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {getInitials(row.storeName)}
          </div>
          <div className="min-w-0">
            <Link
              href={`/vendors/${row.vendorId}`}
              className="truncate font-medium text-foreground hover:text-primary"
            >
              {row.storeName}
            </Link>
            <p className="text-xs text-muted-foreground">ID: {row.vendorCode}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-4 text-right font-semibold text-foreground">
        {formatCurrency(row.pendingBalance)}
      </td>
      <td className="px-3 py-4">
        <span className={eligibilityClass[row.eligibility]}>{eligibilityLabel[row.eligibility]}</span>
        <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
          {row.eligibility === 'BLOCKED' ? `Why blocked: ${row.eligibilityReason}` : row.eligibilityReason}
        </p>
        <p className="mt-1 max-w-[220px] text-[11px] text-muted-foreground">
          {disputeStatusLabel(row.disputeState, row.openDisputeCount)}
        </p>
      </td>
      <td className="px-3 py-4 text-sm text-muted-foreground">
        {row.lastPayoutDate ? (
          <>
            {formatDate(row.lastPayoutDate)}
            {row.lastPayoutAmount != null && (
              <span className="block text-foreground">{formatCurrency(row.lastPayoutAmount)}</span>
            )}
          </>
        ) : (
          '—'
        )}
      </td>
      <td className="px-3 py-4">
        <p className="text-sm text-foreground">KYC: {row.kycStatus}</p>
        <p className="text-xs text-muted-foreground">
          Risk: {row.riskLabel} (score {row.riskScore})
        </p>
        <p className="text-xs text-muted-foreground">
          Bank: {row.hasBankDetails ? 'On file' : 'Not added'}
        </p>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          {row.canRelease ? (
            <Button
              type="button"
              size="sm"
              className="btn-primary-gradient h-8 text-xs"
              disabled={busy}
              onClick={onRelease}
            >
              {'Record & release'}
            </Button>
          ) : row.pendingPayoutId && row.openDisputeCount > 0 ? (
            <span className="rounded-[var(--radius-sm)] bg-[var(--destructive-soft)] px-2 py-1 text-xs font-medium text-[var(--destructive-foreground)]">
              Held by dispute
            </span>
          ) : row.pendingPayoutId ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              disabled={busy}
              onClick={onHold}
            >
              Hold Payout
            </Button>
          ) : row.canCreatePayoutRequest ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              disabled={busy}
              onClick={onCreateRequest}
            >
              Prepare payout
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">No payout request</span>
          )}
          <PayoutRowActionsMenu
            row={row}
            busy={busy}
            onRelease={onRelease}
            onViewHistory={onViewHistory}
            onHold={onHold}
            onCreateRequest={onCreateRequest}
          />
        </div>
      </td>
    </tr>
  );
}
