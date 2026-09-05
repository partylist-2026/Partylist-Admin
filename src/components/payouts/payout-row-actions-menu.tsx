'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  ArrowDownToLine,
  Ban,
  Eye,
  FileText,
  MoreHorizontal,
  CircleDollarSign,
  History,
} from 'lucide-react';
import type { PayoutDashboardQueueItem } from '@/lib/api/payouts.types';
import { Button } from '@/components/ui/button';

interface PayoutRowActionsMenuProps {
  row: PayoutDashboardQueueItem;
  busy: boolean;
  onRelease: () => void;
  onViewHistory: () => void;
  onHold: () => void;
  onCreateRequest: () => void;
}

export function PayoutRowActionsMenu({
  row,
  busy,
  onRelease,
  onViewHistory,
  onHold,
  onCreateRequest,
}: PayoutRowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  function toggleMenu() {
    if (open) {
      setOpen(false);
      return;
    }
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuWidth = 200;
    setMenuPos({
      top: rect.bottom + 4,
      left: Math.max(8, rect.right - menuWidth),
    });
    setOpen(true);
  }

  const menu = open ? (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] cursor-default bg-transparent"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
      />
      <div
        role="menu"
        className="fixed z-[101] min-w-[200px] rounded-[var(--radius-md)] border border-border bg-card py-1 shadow-lg"
        style={{ top: menuPos.top, left: menuPos.left }}
      >
        <Link
          href={`/vendors/${row.vendorId}`}
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
          onClick={() => setOpen(false)}
        >
          <Eye className="h-4 w-4 shrink-0" />
          View vendor profile
        </Link>
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
          onClick={() => {
            setOpen(false);
            onViewHistory();
          }}
        >
          <History className="h-4 w-4 shrink-0" />
          Payout history
        </button>
        <Link
          href={`/vendors/${row.vendorId}`}
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
          onClick={() => setOpen(false)}
        >
          <FileText className="h-4 w-4 shrink-0" />
          Bank &amp; KYC details
        </Link>
        {row.canCreatePayoutRequest && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50"
            disabled={busy}
            onClick={() => {
              setOpen(false);
              onCreateRequest();
            }}
          >
            <CircleDollarSign className="h-4 w-4 shrink-0" />
            Prepare payout
          </button>
        )}
        {row.canRelease && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--success-foreground)] hover:bg-[var(--success-soft)] disabled:opacity-50"
            disabled={busy}
            onClick={() => {
              setOpen(false);
              onRelease();
            }}
          >
            <ArrowDownToLine className="h-4 w-4 shrink-0" />
            Record &amp; release
          </button>
        )}
        {row.pendingPayoutId && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--warning-foreground)] hover:bg-[var(--warning-soft)] disabled:opacity-50"
            disabled={busy}
            onClick={() => {
              setOpen(false);
              onHold();
            }}
          >
            <Ban className="h-4 w-4 shrink-0" />
            Hold payout
          </button>
        )}
      </div>
    </>
  ) : null;

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground"
        aria-label={`More actions for ${row.storeName}`}
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={busy}
        onClick={toggleMenu}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {typeof document !== 'undefined' && menu ? createPortal(menu, document.body) : null}
    </>
  );
}
