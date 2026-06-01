'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Ban, Check, Eye, Loader2, RotateCcw } from 'lucide-react';
import type { AdminVendorDetail } from '@/lib/api/vendors.types';
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

interface VendorDetailActionsProps {
  vendor: AdminVendorDetail;
}

export function VendorDetailActions({ vendor }: VendorDetailActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [impersonateOpen, setImpersonateOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [impersonationReason, setImpersonationReason] = useState('');
  const [impersonationToken, setImpersonationToken] = useState<string | null>(null);

  async function runAction(action: 'approve' | 'suspend' | 'reactivate', suspendReason?: string) {
    setLoading(action);
    setError(null);
    const res = await fetch(`/api/admin/vendors/${vendor.id}/${action}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:
        action === 'suspend'
          ? JSON.stringify({ reason: suspendReason ?? 'Suspended by admin' })
          : undefined,
    });
    setLoading(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Action failed');
      return;
    }
    setSuspendOpen(false);
    setReason('');
    router.refresh();
  }

  async function toggleAvailability() {
    setLoading('availability');
    setError(null);
    const res = await fetch(`/api/admin/vendors/${vendor.id}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !vendor.isAvailable }),
    });
    setLoading(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Failed to update availability');
      return;
    }
    router.refresh();
  }

  async function startVendorView() {
    setLoading('impersonate');
    setError(null);
    setImpersonationToken(null);
    const res = await fetch(`/api/admin/vendors/${vendor.id}/impersonate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: impersonationReason.trim() }),
    });
    setLoading(null);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? 'Failed to start vendor view session');
      return;
    }

    const token = body.data.impersonationToken as string;
    setImpersonationToken(token);

    const vendorAppUrl =
      process.env.NEXT_PUBLIC_VENDOR_APP_URL ?? 'https://partylist-vendor.vercel.app';
    const url = new URL('/login', vendorAppUrl);
    url.searchParams.set('impersonationToken', token);
    url.searchParams.set('expiresAt', body.data.expiresAt);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        disabled={loading !== null}
        onClick={() => setImpersonateOpen(true)}
      >
        <Eye className="h-4 w-4" />
        View as vendor
      </Button>
      {vendor.status === 'UNDER_REVIEW' && (
        <Button
          size="sm"
          className="btn-primary-gradient gap-2"
          disabled={loading !== null}
          onClick={() => runAction('approve')}
        >
          {loading === 'approve' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Approve
        </Button>
      )}
      {vendor.status === 'SUSPENDED' ? (
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          disabled={loading !== null}
          onClick={() => runAction('reactivate')}
        >
          {loading === 'reactivate' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Unsuspend
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-destructive hover:bg-[var(--destructive-soft)]"
          disabled={loading !== null}
          onClick={() => setSuspendOpen(true)}
        >
          <Ban className="h-4 w-4" />
          Suspend
        </Button>
      )}
      {vendor.status === 'APPROVED' && (
        <Button
          size="sm"
          variant="outline"
          disabled={loading !== null}
          onClick={toggleAvailability}
        >
          {loading === 'availability' && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {vendor.isAvailable ? 'Set inactive' : 'Set active'}
        </Button>
      )}
      {error && (
        <p className="w-full text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent onClose={() => setSuspendOpen(false)}>
          <DialogHeader>
            <DialogTitle>Suspend vendor</DialogTitle>
            <DialogDescription>
              Provide a reason for suspending {vendor.storeName}.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-2">
              <Label htmlFor="suspend-reason-detail">Reason</Label>
              <Input
                id="suspend-reason-detail"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-destructive text-white"
              disabled={!reason.trim() || loading !== null}
              onClick={() => runAction('suspend', reason.trim())}
            >
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={impersonateOpen} onOpenChange={setImpersonateOpen}>
        <DialogContent onClose={() => setImpersonateOpen(false)}>
          <DialogHeader>
            <DialogTitle>View as vendor</DialogTitle>
            <DialogDescription>
              Start a read-only 15 minute support session as {vendor.storeName}. A reason is
              required and this action is audited.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-2">
              <Label htmlFor="impersonation-reason">Reason</Label>
              <Input
                id="impersonation-reason"
                value={impersonationReason}
                onChange={(e) => setImpersonationReason(e.target.value)}
                placeholder="Support ticket investigation, vendor requested help..."
              />
              <p className="text-xs text-muted-foreground">
                Impersonated sessions cannot update bank details, services, packages, orders,
                availability, or payouts.
              </p>
            </div>
            {impersonationToken && (
              <div className="rounded-[var(--radius-md)] border border-border bg-muted p-3">
                <p className="text-xs font-medium text-foreground">
                  Vendor view session started. If the vendor app did not open, use this token
                  handoff in the vendor app.
                </p>
                <code className="mt-2 block max-h-20 overflow-auto break-all text-[10px] text-muted-foreground">
                  {impersonationToken}
                </code>
              </div>
            )}
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImpersonateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="btn-primary-gradient"
              disabled={loading !== null || impersonationReason.trim().length < 8}
              onClick={startVendorView}
            >
              {loading === 'impersonate' && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Start view session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
