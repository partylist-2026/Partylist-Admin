'use client';

import { useState } from 'react';
import { MANUAL_PAYOUT_METHODS, type ManualPayoutMethod } from '@/lib/api/payouts.types';
import { formatCurrency } from '@/lib/format';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PayoutReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorName: string;
  amount: number;
  payoutId: string;
  warning?: string;
  onSuccess: () => void;
}

export function PayoutReleaseDialog({
  open,
  onOpenChange,
  vendorName,
  amount,
  payoutId,
  warning,
  onSuccess,
}: PayoutReleaseDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<ManualPayoutMethod>('BANK_TRANSFER');
  const [transactionReference, setTransactionReference] = useState('');
  const [transferredAt, setTransferredAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!transactionReference.trim()) {
      setError('Transaction / reference ID is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          transactionReference: transactionReference.trim(),
          note: note.trim() || undefined,
          transferredAt: transferredAt ? new Date(transferredAt).toISOString() : undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Release failed');
      onOpenChange(false);
      setTransactionReference('');
      setNote('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Release failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Record manual payout</DialogTitle>
            <DialogDescription>
              Confirm you sent {formatCurrency(amount)} to {vendorName}. This records how and when
              you paid, and marks the payout complete in Partylist.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {warning && (
              <p
                role="alert"
                className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-foreground)]"
              >
                {warning}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="payout-method">Payment method</Label>
              <select
                id="payout-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as ManualPayoutMethod)}
                className="flex h-10 w-full rounded-[var(--radius-md)] border border-border bg-card px-3 text-sm text-foreground"
              >
                {MANUAL_PAYOUT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-tx-ref">Transaction / reference ID</Label>
              <Input
                id="payout-tx-ref"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="Bank ref, UTR, wire ID, check #..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-transferred-at">Transfer date &amp; time</Label>
              <Input
                id="payout-transferred-at"
                type="datetime-local"
                value={transferredAt}
                onChange={(e) => setTransferredAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-note">Admin note (optional)</Label>
              <Input
                id="payout-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Paid to account ending 4521"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-primary-gradient" disabled={loading}>
              {loading ? 'Saving…' : 'Confirm & release'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
