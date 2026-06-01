'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  BadgeCheck,
  Clock3,
  CreditCard,
  Search,
  ShieldAlert,
} from 'lucide-react';
import type {
  DisputeDashboardData,
  DisputeDashboardTab,
  DisputeDetail,
  DisputeListItem,
  DisputeStatus,
} from '@/lib/api/disputes.types';
import { formatCurrency, formatDate, formatNumber, formatRelativeTime, getInitials } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VendorMetricCard } from '@/components/vendors/vendor-metric-card';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const TAB_ITEMS: Array<{
  id: DisputeDashboardTab;
  label: string;
}> = [
  { id: 'ACTION_REQUIRED', label: 'Action Required' },
  { id: 'UNDER_REVIEW', label: 'Under Review' },
  { id: 'RESOLVED', label: 'Resolved' },
  { id: 'ALL', label: 'All Cases' },
];

function statusChipClass(status: DisputeStatus): string {
  if (status === 'OPEN') return 'metric-chip metric-chip-destructive';
  if (status === 'IN_REVIEW') return 'metric-chip metric-chip-warning';
  return 'metric-chip metric-chip-success';
}

function statusLabel(status: DisputeStatus): string {
  if (status === 'OPEN') return 'Action Required';
  if (status === 'IN_REVIEW') return 'In Review';
  if (status === 'RESOLVED') return 'Resolved';
  return 'Closed';
}

function caseRef(caseId: string): string {
  return `#${caseId.slice(0, 8).toUpperCase()}`;
}

interface RefundsDisputesViewProps {
  initial: DisputeDashboardData;
  initialTab: DisputeDashboardTab;
  initialSearch: string;
  initialPage: number;
  initialLoadError?: string | null;
}

export function RefundsDisputesView({
  initial,
  initialTab,
  initialSearch,
  initialPage,
  initialLoadError = null,
}: RefundsDisputesViewProps) {
  const [dashboard, setDashboard] = useState<DisputeDashboardData>(initial);
  const [activeTab, setActiveTab] = useState<DisputeDashboardTab>(initialTab);
  const [page, setPage] = useState<number>(initialPage);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initialLoadError);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(initial.cases[0]?.id ?? null);
  const [selectedDetail, setSelectedDetail] = useState<DisputeDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [decisionModal, setDecisionModal] = useState<{
    decision: 'APPROVE' | 'REJECT';
    open: boolean;
  }>({ decision: 'APPROVE', open: false });
  const [adminNote, setAdminNote] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [stripeReference, setStripeReference] = useState('');
  const [isPending, startTransition] = useTransition();

  const selectedCase = useMemo(
    () => dashboard.cases.find((item) => item.id === selectedCaseId) ?? null,
    [dashboard.cases, selectedCaseId]
  );

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({
        tab: activeTab,
        page: String(page),
        limit: String(dashboard.pagination.limit || 12),
      });
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/admin/disputes/dashboard?${params.toString()}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.error ?? `Dashboard load failed (${res.status})`);
      }
      const nextDashboard = body.data as DisputeDashboardData;
      setDashboard(nextDashboard);
      setSelectedCaseId((current) => {
        if (current && nextDashboard.cases.some((item) => item.id === current)) return current;
        return nextDashboard.cases[0]?.id ?? null;
      });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load refunds & disputes data');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, dashboard.pagination.limit, page, search]);

  const fetchDetail = useCallback(async (disputeId: string) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.error ?? `Case detail load failed (${res.status})`);
      }
      setSelectedDetail(body.data as DisputeDetail);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to load case detail');
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!selectedCaseId) {
      setSelectedDetail(null);
      return;
    }
    fetchDetail(selectedCaseId);
  }, [fetchDetail, selectedCaseId]);

  async function runAction(
    endpoint: string,
    method: 'PATCH' | 'POST',
    payload?: Record<string, unknown>
  ) {
    setActionError(null);
    setActionMessage(null);
    const res = await fetch(endpoint, {
      method,
      headers: payload ? { 'Content-Type': 'application/json' } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.error ?? 'Action failed');
    }
  }

  function refreshAfterAction(message: string) {
    setActionMessage(message);
    fetchDashboard();
    if (selectedCaseId) fetchDetail(selectedCaseId);
  }

  function onSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(() => {
      setPage(1);
      setSearch(searchInput.trim());
    });
  }

  function startReview(disputeId: string) {
    setActionBusy(true);
    (async () => {
      try {
        await runAction(`/api/admin/disputes/${disputeId}/review`, 'PATCH');
        refreshAfterAction('Case moved to review queue.');
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'Could not start case review');
      } finally {
        setActionBusy(false);
      }
    })();
  }

  function resolveDecision() {
    if (!selectedCaseId) return;
    if (adminNote.trim().length < 10) {
      setActionError('Admin note must be at least 10 characters.');
      return;
    }
    const decision = decisionModal.decision;
    setActionBusy(true);
    (async () => {
      try {
        await runAction(`/api/admin/disputes/${selectedCaseId}/resolve`, 'PATCH', {
          decision,
          adminNote: adminNote.trim(),
        });
        setDecisionModal({ decision, open: false });
        setAdminNote('');
        refreshAfterAction(
          decision === 'APPROVE'
            ? 'Refund approved. Case is now waiting for finance confirmation.'
            : 'Refund rejected and case closed.'
        );
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'Could not resolve dispute');
      } finally {
        setActionBusy(false);
      }
    })();
  }

  function confirmRefund() {
    if (!selectedCaseId) return;
    if (!stripeReference.trim()) {
      setActionError('Stripe refund reference is required.');
      return;
    }
    setActionBusy(true);
    (async () => {
      try {
        await runAction(`/api/admin/disputes/${selectedCaseId}/confirm-refund`, 'POST', {
          stripeReference: stripeReference.trim(),
        });
        setConfirmModalOpen(false);
        setStripeReference('');
        refreshAfterAction('Refund confirmed and ledger updated.');
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'Could not confirm refund');
      } finally {
        setActionBusy(false);
      }
    })();
  }

  return (
    <div className="dashboard-scroll space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Refunds &amp; Disputes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage refund requests, review dispute evidence, and confirm financial outcomes.
          </p>
        </div>
        <form onSubmit={onSearchSubmit} className="flex w-full max-w-md items-center gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search case, order ID, vendor"
          />
          <Button type="submit" size="sm" variant="outline" disabled={isPending}>
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>
      </header>

      {loadError && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--destructive)_35%,transparent)] bg-[var(--destructive-soft)] px-4 py-3 text-sm text-[var(--destructive-foreground)]"
        >
          {loadError}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--destructive)_35%,transparent)] bg-[var(--destructive-soft)] px-4 py-3 text-sm text-[var(--destructive-foreground)]"
        >
          {actionError}
        </div>
      )}

      {actionMessage && (
        <div
          role="status"
          className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success-foreground)]"
        >
          {actionMessage}
        </div>
      )}

      <div className="metrics-grid">
        <VendorMetricCard
          title="Open Disputes"
          value={formatNumber(dashboard.kpis.openDisputes)}
          chip={{ label: 'Action required', tone: 'destructive' }}
          icon={ShieldAlert}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--destructive)_14%,transparent)] text-destructive"
        />
        <VendorMetricCard
          title="Pending Refunds"
          value={formatNumber(dashboard.kpis.pendingRefunds)}
          chip={{ label: 'Awaiting finance', tone: 'warning' }}
          icon={Clock3}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-warning"
        />
        <VendorMetricCard
          title="Avg Resolution Time"
          value={`${dashboard.kpis.avgResolutionTimeHours}h`}
          chip={{ label: 'Resolved cases', tone: 'success' }}
          icon={ArrowLeftRight}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--success)_16%,transparent)] text-success"
        />
        <VendorMetricCard
          title="Amount Refunded (30d)"
          value={formatCurrency(dashboard.kpis.amountRefunded30d)}
          chip={{ label: 'Ledger verified', tone: 'success' }}
          icon={CreditCard}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-primary"
        />
      </div>

      <section className="admin-panel-card overflow-hidden">
        <div className="grid min-h-[640px] grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="border-b border-border bg-card xl:border-b-0 xl:border-r">
            <div className="border-b border-border px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {TAB_ITEMS.map((tab) => {
                  const count =
                    tab.id === 'ACTION_REQUIRED'
                      ? dashboard.statusBreakdown.open
                      : tab.id === 'UNDER_REVIEW'
                        ? dashboard.statusBreakdown.inReview
                        : tab.id === 'RESOLVED'
                          ? dashboard.statusBreakdown.resolved + dashboard.statusBreakdown.closed
                          : dashboard.pagination.total;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setPage(1);
                      }}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium transition-colors',
                        activeTab === tab.id
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {tab.label}
                      <span className="text-[10px] opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <ul className="max-h-[560px] overflow-y-auto">
              {dashboard.cases.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No cases match this filter.
                </li>
              ) : (
                dashboard.cases.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedCaseId(item.id)}
                      className={cn(
                        'w-full border-l-2 px-4 py-3 text-left transition-colors',
                        selectedCaseId === item.id
                          ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_8%,white)]'
                          : 'border-transparent hover:bg-muted/70'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={statusChipClass(item.status)}>{statusLabel(item.status)}</span>
                        <span className="text-[11px] text-muted-foreground">{formatRelativeTime(item.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-foreground">Case {caseRef(item.id)}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.reason}</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{item.order.vendor.storeName}</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(item.order.totalAmount)}
                        </span>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>

            <footer className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
              <span>
                Page {dashboard.pagination.page} of {dashboard.pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={dashboard.pagination.page <= 1 || isPending}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={dashboard.pagination.page >= dashboard.pagination.totalPages || isPending}
                  onClick={() =>
                    setPage((prev) => Math.min(dashboard.pagination.totalPages, prev + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </footer>
          </aside>

          <div className="flex min-h-[640px] flex-col">
            {isDetailLoading || isLoading ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Loading case details...
              </div>
            ) : !selectedCase || !selectedDetail ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Select a case to review evidence and resolve.
              </div>
            ) : (
              <>
                <header className="border-b border-border px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Case {caseRef(selectedDetail.id)}</p>
                      <h2 className="mt-1 text-lg font-semibold text-foreground">
                        {selectedDetail.order.vendor.storeName}
                      </h2>
                    </div>
                    <div className="text-right">
                      <span className={statusChipClass(selectedDetail.status)}>
                        {statusLabel(selectedDetail.status)}
                      </span>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Opened {formatDate(selectedDetail.createdAt)}
                      </p>
                    </div>
                  </div>
                </header>

                <div className="grid flex-1 gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <section className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoCard
                        label="Order"
                        value={selectedDetail.orderId}
                        subValue={`Status: ${selectedDetail.order.status}`}
                      />
                      <InfoCard
                        label="Disputed Amount"
                        value={formatCurrency(selectedDetail.order.totalAmount)}
                        subValue={`Raised by: ${selectedDetail.raisedBy}`}
                      />
                    </div>

                    <article className="rounded-[var(--radius-md)] border border-border bg-card p-4">
                      <h3 className="text-sm font-semibold text-foreground">Claim details &amp; evidence</h3>
                      <div className="mt-3 space-y-3">
                        <EvidenceBlock
                          tone="warning"
                          title="Claim statement"
                          body={selectedDetail.reason}
                          timeLabel={`Submitted ${formatRelativeTime(selectedDetail.createdAt)}`}
                        />
                        <EvidenceBlock
                          tone="info"
                          title="Payment snapshot"
                          body={
                            selectedDetail.order.payment
                              ? `Payment ${selectedDetail.order.payment.id} • ${selectedDetail.order.payment.status} • ${formatCurrency(selectedDetail.order.payment.amount)}`
                              : 'No payment record linked to this order.'
                          }
                          timeLabel={
                            selectedDetail.order.payment?.stripePaymentIntent
                              ? `Intent: ${selectedDetail.order.payment.stripePaymentIntent}`
                              : 'Stripe intent unavailable'
                          }
                        />
                        <EvidenceBlock
                          tone="success"
                          title="Admin resolution note"
                          body={selectedDetail.resolution ?? 'Pending admin note'}
                          timeLabel={
                            selectedDetail.resolvedAt
                              ? `Updated ${formatRelativeTime(selectedDetail.resolvedAt)}`
                              : 'Not resolved yet'
                          }
                        />
                      </div>
                    </article>
                  </section>

                  <aside className="space-y-3">
                    <article className="rounded-[var(--radius-md)] border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Case owner</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                          {getInitials(selectedDetail.order.vendor.storeName)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {selectedDetail.order.vendor.storeName}
                          </p>
                          <p className="text-xs text-muted-foreground">{selectedDetail.order.vendor.id}</p>
                        </div>
                      </div>
                    </article>

                    <article className="rounded-[var(--radius-md)] border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Administrative actions</p>
                      <div className="mt-3 space-y-2">
                        {selectedDetail.status === 'OPEN' && (
                          <Button
                            className="w-full btn-primary-gradient"
                            onClick={() => startReview(selectedDetail.id)}
                            disabled={isPending || actionBusy}
                          >
                            Start review
                          </Button>
                        )}

                        {selectedDetail.status === 'IN_REVIEW' && (
                          <>
                            <Button
                              variant="outline"
                              className="w-full"
                              disabled={isPending || actionBusy}
                              onClick={() => setDecisionModal({ decision: 'REJECT', open: true })}
                            >
                              Reject refund
                            </Button>
                            <Button
                              className="w-full btn-primary-gradient"
                              disabled={isPending || actionBusy}
                              onClick={() => setDecisionModal({ decision: 'APPROVE', open: true })}
                            >
                              Approve refund
                            </Button>
                          </>
                        )}

                        {selectedDetail.status === 'RESOLVED' && (
                          <Button
                            className="w-full btn-primary-gradient"
                            disabled={isPending || actionBusy}
                            onClick={() => setConfirmModalOpen(true)}
                          >
                            Confirm refund
                          </Button>
                        )}

                        {(selectedDetail.status === 'CLOSED' || selectedDetail.status === 'RESOLVED') && (
                          <p className="rounded-[var(--radius-sm)] bg-muted px-2 py-1 text-xs text-muted-foreground">
                            {selectedDetail.status === 'CLOSED'
                              ? 'Case closed. No further action required.'
                              : 'Waiting for finance confirmation.'}
                          </p>
                        )}
                      </div>
                    </article>
                  </aside>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <DecisionDialog
        open={decisionModal.open}
        decision={decisionModal.decision}
        note={adminNote}
        onNoteChange={setAdminNote}
        onClose={() => setDecisionModal((prev) => ({ ...prev, open: false }))}
        onConfirm={resolveDecision}
        loading={isPending || actionBusy}
      />

      <ConfirmRefundDialog
        open={confirmModalOpen}
        stripeReference={stripeReference}
        onReferenceChange={setStripeReference}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmRefund}
        loading={isPending || actionBusy}
      />
    </div>
  );
}

function InfoCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{subValue}</p>
    </div>
  );
}

function EvidenceBlock({
  tone,
  title,
  body,
  timeLabel,
}: {
  tone: 'warning' | 'success' | 'info';
  title: string;
  body: string;
  timeLabel: string;
}) {
  const toneClass =
    tone === 'warning'
      ? 'border-[color-mix(in_srgb,var(--warning)_30%,transparent)] bg-[var(--warning-soft)] text-[var(--warning-foreground)]'
      : tone === 'success'
        ? 'border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[var(--success-soft)] text-[var(--success-foreground)]'
        : 'border-border bg-muted text-foreground';
  return (
    <div className={cn('rounded-[var(--radius-md)] border px-3 py-2', toneClass)}>
      <p className="text-xs font-semibold">{title}</p>
      <p className="mt-1 text-sm">{body}</p>
      <p className="mt-1 text-[11px] opacity-80">{timeLabel}</p>
    </div>
  );
}

function DecisionDialog({
  open,
  decision,
  note,
  onNoteChange,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  decision: 'APPROVE' | 'REJECT';
  note: string;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{decision === 'APPROVE' ? 'Approve refund' : 'Reject refund'}</DialogTitle>
          <DialogDescription>
            Add an auditable note for this decision. Minimum 10 characters.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <label htmlFor="admin-note" className="text-sm font-medium text-foreground">
            Administrative note
          </label>
          <textarea
            id="admin-note"
            className="mt-2 min-h-[120px] w-full rounded-[var(--radius-md)] border border-border bg-input px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary/25"
            placeholder="Describe the investigation outcome and why this decision is compliant."
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {note.trim().length} / 10+ characters required
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={decision === 'APPROVE' ? 'btn-primary-gradient' : ''}
            variant={decision === 'APPROVE' ? 'default' : 'destructive'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Saving…' : decision === 'APPROVE' ? 'Approve' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmRefundDialog({
  open,
  stripeReference,
  onReferenceChange,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  stripeReference: string;
  onReferenceChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Confirm refund settlement</DialogTitle>
          <DialogDescription>
            Enter the Stripe refund reference after the transfer is complete.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-2">
          <label htmlFor="stripe-reference" className="text-sm font-medium text-foreground">
            Stripe reference
          </label>
          <Input
            id="stripe-reference"
            value={stripeReference}
            onChange={(e) => onReferenceChange(e.target.value)}
            placeholder="re_123..., txn..., or internal reference"
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="btn-primary-gradient" onClick={onConfirm} disabled={loading}>
            {loading ? 'Confirming…' : 'Confirm refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
