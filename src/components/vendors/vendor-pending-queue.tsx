import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import type { AdminVendorListItem } from '@/lib/api/vendors.types';
import { formatDistanceToNow } from '@/lib/format-relative';
import { VendorStatusBadge } from '@/components/vendors/vendor-status-badge';

interface VendorPendingQueueProps {
  vendors: AdminVendorListItem[];
}

export function VendorPendingQueue({ vendors }: VendorPendingQueueProps) {
  return (
    <article className="admin-panel-card flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Pending approval</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Vendors awaiting admin review
          </p>
        </div>
        <Link
          href="/vendors?status=UNDER_REVIEW"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </header>

      <div className="flex-1 divide-y divide-border">
        {vendors.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No vendors pending approval.
          </p>
        ) : (
          vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--warning-soft)] text-[var(--warning-foreground)]">
                <Clock className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {vendor.storeName}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <VendorStatusBadge status={vendor.status} />
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(vendor.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
