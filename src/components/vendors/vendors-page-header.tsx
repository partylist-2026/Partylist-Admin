'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VendorStatus } from '@/lib/api/vendors.types';

interface VendorsPageHeaderProps {
  statusFilter: VendorStatus | '';
  onAddVendor?: () => void;
}

const STATUS_OPTIONS: Array<{ value: VendorStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'UNDER_REVIEW', label: 'Pending approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export function VendorsPageHeader({ statusFilter, onAddVendor }: VendorsPageHeaderProps) {
  const router = useRouter();

  function onStatusChange(value: VendorStatus | '') {
    const params = new URLSearchParams(window.location.search);
    if (!value) params.delete('status');
    else params.set('status', value);
    params.set('page', '1');
    router.push(`/vendors?${params.toString()}`);
  }

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Vendors Management
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Review vendor accounts, onboarding status, and performance across the
          Partylist marketplace.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="relative">
          <select
            className="h-10 min-w-[148px] appearance-none rounded-[var(--radius-md)] border border-border bg-input pl-3 pr-9 text-sm font-medium text-foreground"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as VendorStatus | '')}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>
        <Button
          className="btn-primary-gradient h-10 gap-2 px-4"
          onClick={onAddVendor}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add vendor
        </Button>
      </div>
    </header>
  );
}
