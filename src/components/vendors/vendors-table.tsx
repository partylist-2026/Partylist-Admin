'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Search,
  X,
} from 'lucide-react';
import type { AdminVendorListItem, VendorStatus } from '@/lib/api/vendors.types';
import { formatCurrency, formatNumber, getInitials } from '@/lib/format';
import { VendorStatusBadge, KycStatusBadge } from '@/components/vendors/vendor-status-badge';
import { VendorActionsMenu } from '@/components/vendors/vendor-actions-menu';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface VendorsTableProps {
  vendors: AdminVendorListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  initialSearch?: string;
  initialStatus?: VendorStatus | '';
}

function vendorCode(id: string) {
  return `#V-${id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
}

export function VendorsTable({
  vendors,
  pagination,
  initialSearch = '',
}: VendorsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);

  function updateQuery(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    if (updates.search !== undefined && !updates.page) {
      params.set('page', '1');
    }
    startTransition(() => {
      router.push(`/vendors?${params.toString()}`);
    });
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(vendors.map((v) => v.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function runAction(vendorId: string, action: 'approve' | 'suspend') {
    setActionError(null);
    const res = await fetch(`/api/admin/vendors/${vendorId}/${action}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:
        action === 'suspend'
          ? JSON.stringify({ reason: 'Suspended by admin' })
          : undefined,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setActionError(body.error ?? 'Action failed');
      return;
    }
    router.refresh();
  }

  async function approveSelected() {
    setActionError(null);
    for (const id of selected) {
      const vendor = vendors.find((v) => v.id === id);
      if (vendor?.status !== 'UNDER_REVIEW') continue;
      await runAction(id, 'approve');
    }
    setSelected(new Set());
  }

  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const to = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <section className="admin-panel-card overflow-hidden">
      <div className="space-y-4 border-b border-border px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search vendors..."
              className="h-10 border-border bg-input pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateQuery({ search, page: '1' });
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-border bg-card"
              onClick={() => updateQuery({ search, page: '1' })}
              disabled={isPending}
            >
              <Filter className="h-4 w-4" aria-hidden />
              Filters
            </Button>
            <Button
              size="sm"
              className="btn-primary-gradient h-9"
              disabled={selected.size === 0 || isPending}
              onClick={approveSelected}
            >
              <Check className="h-4 w-4" aria-hidden />
              Approve selected
            </Button>
          </div>
        </div>
        {actionError && (
          <p className="text-sm text-destructive" role="alert">
            {actionError}
          </p>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 pl-5">
              <input
                type="checkbox"
                aria-label="Select all vendors"
                checked={vendors.length > 0 && selected.size === vendors.length}
                onChange={(e) => toggleAll(e.target.checked)}
              />
            </TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>KYC</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead className="pr-5 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                No vendors match your filters.
              </TableCell>
            </TableRow>
          ) : (
            vendors.map((vendor) => {
              const ratingPct =
                vendor.averageRating !== null
                  ? Math.round((vendor.averageRating / 5) * 100)
                  : 0;

              return (
                <TableRow key={vendor.id}>
                  <TableCell className="pl-5">
                    <input
                      type="checkbox"
                      aria-label={`Select ${vendor.storeName}`}
                      checked={selected.has(vendor.id)}
                      onChange={(e) => toggleOne(vendor.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                        {getInitials(vendor.storeName)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {vendor.storeName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {vendorCode(vendor.id)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate text-muted-foreground">
                    {vendor.categoryName ?? '—'}
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate text-muted-foreground">
                    {vendor.serviceCity ?? '—'}
                  </TableCell>
                  <TableCell>
                    <VendorStatusBadge status={vendor.status} />
                  </TableCell>
                  <TableCell>
                    <KycStatusBadge status={vendor.kycStatus} />
                  </TableCell>
                  <TableCell className="min-w-[148px]">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          {vendor.averageRating !== null
                            ? `${vendor.averageRating.toFixed(1)}/5`
                            : 'No rating'}
                        </span>
                        <span>{formatNumber(vendor.totalOrders)} orders</span>
                      </div>
                      <Progress
                        value={ratingPct}
                        max={100}
                        indicatorClassName={
                          vendor.status === 'UNDER_REVIEW' ? 'bg-muted-foreground/40' : undefined
                        }
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {formatCurrency(vendor.totalRevenue)} revenue
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="pr-5">
                    <div className="flex items-center justify-end gap-0.5">
                      {vendor.status === 'UNDER_REVIEW' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[var(--success-foreground)] hover:bg-[var(--success-soft)]"
                            aria-label="Approve vendor"
                            disabled={isPending}
                            onClick={() => runAction(vendor.id, 'approve')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[var(--destructive-foreground)] hover:bg-[var(--destructive-soft)]"
                            aria-label="Reject vendor"
                            disabled={isPending}
                            onClick={() => runAction(vendor.id, 'suspend')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                        <Link
                          href={`/vendors/${vendor.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={`View ${vendor.storeName}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <VendorActionsMenu vendor={vendor} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-sm text-muted-foreground">
          Showing {from} to {to} of {formatNumber(pagination.total)} vendors
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border"
            disabled={pagination.page <= 1 || isPending}
            onClick={() => updateQuery({ page: String(pagination.page - 1) })}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === pagination.page;
            return (
              <Button
                key={pageNum}
                variant={isActive ? 'default' : 'outline'}
                size="icon"
                className={
                  isActive
                    ? 'h-8 w-8 btn-primary-gradient border-0'
                    : 'h-8 w-8 border-border'
                }
                disabled={isPending}
                onClick={() => updateQuery({ page: String(pageNum) })}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border"
            disabled={pagination.page >= pagination.totalPages || isPending}
            onClick={() => updateQuery({ page: String(pagination.page + 1) })}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
