import { cn } from '@/lib/utils';
import type { KycStatus, VendorStatus } from '@/lib/api/vendors.types';

const statusConfig: Record<
  VendorStatus,
  { label: string; className: string }
> = {
  APPROVED: { label: 'Approved', className: 'badge-soft-success' },
  UNDER_REVIEW: { label: 'Pending approval', className: 'badge-soft-warning' },
  SUSPENDED: { label: 'Suspended', className: 'badge-soft-destructive' },
};

const kycConfig: Record<
  KycStatus,
  { label: string; className: string }
> = {
  APPROVED: { label: 'Verified', className: 'badge-soft-success' },
  PENDING: { label: 'Pending', className: 'badge-soft-warning' },
  REJECTED: { label: 'Rejected', className: 'badge-soft-destructive' },
};

function BadgePill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-md)] px-2 py-0.5 text-xs font-medium',
        className
      )}
    >
      {label}
    </span>
  );
}

export function VendorStatusBadge({ status }: { status: VendorStatus }) {
  const config = statusConfig[status];
  return <BadgePill label={config.label} className={config.className} />;
}

export function KycStatusBadge({ status }: { status: KycStatus | null }) {
  if (!status) {
    return (
      <BadgePill label="Not submitted" className="bg-muted text-muted-foreground" />
    );
  }
  const config = kycConfig[status];
  return <BadgePill label={config.label} className={config.className} />;
}
