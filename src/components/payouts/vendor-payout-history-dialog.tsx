'use client';

import { useCallback, useEffect, useState } from 'react';
import type { VendorPayoutListResponse, VendorPayoutRecord } from '@/lib/api/payouts.types';
import { MANUAL_PAYOUT_METHODS } from '@/lib/api/payouts.types';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function methodLabel(value: string | null): string {
  if (!value) return '—';
  return MANUAL_PAYOUT_METHODS.find((m) => m.value === value)?.label ?? value.replace(/_/g, ' ');
}

interface VendorPayoutHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  vendorName: string;
}

export function VendorPayoutHistoryDialog({
  open,
  onOpenChange,
  vendorId,
  vendorName,
}: VendorPayoutHistoryDialogProps) {
  const [data, setData] = useState<VendorPayoutListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/payouts/vendors/${vendorId}/history?page=${page}&limit=15`
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Failed to load payouts');
      setData(body.data as VendorPayoutListResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [vendorId, page]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Payout history — {vendorName}</DialogTitle>
          <DialogDescription>
            All payout requests and manual release records for this vendor.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {loading && !data && (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          )}
          {error && (
            <p className="py-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {data && (
            <div className="max-h-[min(60vh,480px)] overflow-auto rounded-[var(--radius-md)] border border-border">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2">Requested</th>
                    <th className="px-3 py-2">Released</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2">Reference</th>
                    <th className="px-3 py-2">By</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                        No payouts yet.
                      </td>
                    </tr>
                  ) : (
                    data.payouts.map((p: VendorPayoutRecord) => (
                      <PayoutHistoryRow key={p.id} payout={p} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {data && data.pagination.totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {data.pagination.page} of {data.pagination.totalPages} (
                {formatNumber(data.pagination.total)} total)
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PayoutHistoryRow({ payout }: { payout: VendorPayoutRecord }) {
  return (
    <tr className="border-t border-border">
      <td className="px-3 py-2.5 text-muted-foreground">{formatDate(payout.createdAt)}</td>
      <td className="px-3 py-2.5 text-muted-foreground">
        {payout.releasedAt ? formatDate(payout.releasedAt) : '—'}
      </td>
      <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(payout.amount)}</td>
      <td className="px-3 py-2.5">
        <span className="metric-chip bg-muted text-muted-foreground">{payout.status}</span>
      </td>
      <td className="px-3 py-2.5">{methodLabel(payout.paymentMethod)}</td>
      <td className="max-w-[140px] truncate px-3 py-2.5 font-mono text-xs" title={payout.transactionReference ?? ''}>
        {payout.transactionReference ?? '—'}
      </td>
      <td className="px-3 py-2.5 text-xs text-muted-foreground">
        {payout.releasedByAdminEmail ?? '—'}
      </td>
    </tr>
  );
}
