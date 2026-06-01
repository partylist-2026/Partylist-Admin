'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
  Ban,
  Check,
  Eye,
  MoreHorizontal,
  RotateCcw,
} from 'lucide-react';
import type { AdminVendorListItem } from '@/lib/api/vendors.types';
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

interface VendorActionsMenuProps {
  vendor: AdminVendorListItem;
}

export function VendorActionsMenu({ vendor }: VendorActionsMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: 'approve' | 'suspend' | 'reactivate', suspendReason?: string) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/vendors/${vendor.id}/${action}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:
        action === 'suspend'
          ? JSON.stringify({ reason: suspendReason ?? 'Suspended by admin' })
          : undefined,
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Action failed');
      return false;
    }
    setOpen(false);
    setSuspendOpen(false);
    setReason('');
    router.refresh();
    return true;
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          aria-label="Vendor actions"
          onClick={() => setOpen((v) => !v)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-[var(--radius-md)] border border-border bg-card py-1 shadow-lg">
              <Link
                href={`/vendors/${vendor.id}`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                <Eye className="h-4 w-4" />
                View details
              </Link>
              {vendor.status === 'UNDER_REVIEW' && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--success-foreground)] hover:bg-[var(--success-soft)]"
                  disabled={loading}
                  onClick={() => runAction('approve')}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
              )}
              {vendor.status !== 'SUSPENDED' && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--destructive-foreground)] hover:bg-[var(--destructive-soft)]"
                  disabled={loading}
                  onClick={() => {
                    setOpen(false);
                    setSuspendOpen(true);
                  }}
                >
                  <Ban className="h-4 w-4" />
                  Suspend
                </button>
              )}
              {vendor.status === 'SUSPENDED' && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-secondary"
                  disabled={loading}
                  onClick={() => runAction('reactivate')}
                >
                  <RotateCcw className="h-4 w-4" />
                  Unsuspend
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent onClose={() => setSuspendOpen(false)}>
          <DialogHeader>
            <DialogTitle>Suspend vendor</DialogTitle>
            <DialogDescription>
              Provide a reason for suspending {vendor.storeName}. This will block marketplace
              activity.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-2">
              <Label htmlFor={`suspend-reason-${vendor.id}`}>Reason</Label>
              <Input
                id={`suspend-reason-${vendor.id}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Policy violation, fraud review..."
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-destructive text-white hover:opacity-90"
              disabled={loading || !reason.trim()}
              onClick={() => runAction('suspend', reason.trim())}
            >
              Suspend vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
