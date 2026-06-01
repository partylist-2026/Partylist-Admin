import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { AdminVendorDetail } from '@/lib/api/vendors.types';
import { MANUAL_PAYOUT_METHODS } from '@/lib/api/payouts.types';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';

function payoutMethodLabel(value: string | null): string {
  if (!value) return '—';
  return MANUAL_PAYOUT_METHODS.find((m) => m.value === value)?.label ?? value.replace(/_/g, ' ');
}
import { VendorDetailActions } from '@/components/vendors/vendor-detail-actions';
import { VendorStatusBadge, KycStatusBadge } from '@/components/vendors/vendor-status-badge';

interface VendorDetailViewProps {
  vendor: AdminVendorDetail;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="admin-panel-card overflow-hidden">
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function VendorDetailView({ vendor }: VendorDetailViewProps) {
  return (
    <div className="dashboard-scroll space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to vendors
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {vendor.storeName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {vendor.ownerUser.email ?? 'No owner email'} · Joined{' '}
              {formatDate(vendor.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <VendorStatusBadge status={vendor.status} />
            <KycStatusBadge status={vendor.kycStatus} />
            {vendor.status === 'APPROVED' && (
              <span
                className={
                  vendor.isAvailable
                    ? 'metric-chip metric-chip-success'
                    : 'metric-chip bg-muted text-muted-foreground'
                }
              >
                {vendor.isAvailable ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
        </div>
        <VendorDetailActions vendor={vendor} />
      </div>

      {vendor.suspensionReason && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--destructive)_30%,transparent)] bg-[var(--destructive-soft)] px-4 py-3 text-sm text-[var(--destructive-foreground)]"
        >
          <strong>Suspended:</strong> {vendor.suspensionReason}
          {vendor.suspendedAt && (
            <span className="block text-xs opacity-80">
              Since {formatDate(vendor.suspendedAt)}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Profile" description="Store and contact information">
          <dl className="space-y-3">
            <DetailRow label="Description" value={vendor.description ?? '—'} />
            <DetailRow label="Category" value={vendor.categoryName ?? '—'} />
            <DetailRow label="Location" value={vendor.serviceCity ?? '—'} />
            <DetailRow label="Address" value={vendor.address ?? '—'} />
            <DetailRow label="Contact email" value={vendor.contactEmail ?? '—'} />
            <DetailRow label="Contact phone" value={vendor.contactPhone ?? '—'} />
            <DetailRow label="Owner phone" value={vendor.ownerUser.phone ?? '—'} />
            <DetailRow
              label="Commission"
              value={`${(vendor.commissionRate * 100).toFixed(1)}%`}
            />
            <DetailRow
              label="Onboarding"
              value={vendor.onboardingComplete ? 'Complete' : 'Incomplete'}
            />
          </dl>
        </SectionCard>

        <SectionCard title="Performance" description="Orders and earnings snapshot">
          <dl className="space-y-3">
            <DetailRow label="Rating" value={vendor.averageRating?.toFixed(1) ?? '—'} />
            <DetailRow label="Reviews" value={formatNumber(vendor.reviewCount)} />
            <DetailRow label="Total bookings" value={formatNumber(vendor.totalBookings)} />
            <DetailRow label="Active orders" value={formatNumber(vendor.activeOrdersCount)} />
            <DetailRow
              label="Completed orders"
              value={formatNumber(vendor.completedOrdersCount)}
            />
            <DetailRow label="Disputes" value={formatNumber(vendor.disputeCount)} />
            <DetailRow
              label="Total earnings"
              value={formatCurrency(vendor.ledgerSummary.totalEarnings)}
            />
            <DetailRow
              label="Paid out"
              value={formatCurrency(vendor.ledgerSummary.totalPaidOut)}
            />
            <DetailRow
              label="Pending balance"
              value={formatCurrency(vendor.ledgerSummary.pendingBalance)}
            />
          </dl>
        </SectionCard>

        <SectionCard title="Bank details" description="Payout account when provided">
          {vendor.bankDetails ? (
            <dl className="space-y-3">
              <DetailRow label="Account holder" value={vendor.bankDetails.accountHolderName} />
              <DetailRow label="Bank" value={vendor.bankDetails.bankName} />
              <DetailRow label="Account" value={`••••${vendor.bankDetails.accountNumber.slice(-4)}`} />
              <DetailRow label="Currency" value={vendor.bankDetails.currency} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No bank details on file.</p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Support requests" description="Tickets raised by or for this vendor">
        {vendor.supportTickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No support tickets.</p>
        ) : (
          <ul className="divide-y divide-border">
            {vendor.supportTickets.map((ticket) => (
              <li key={ticket.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{ticket.subject}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p className="font-medium uppercase tracking-wide">{ticket.status}</p>
                    <p>{ticket.category} · {ticket.priority}</p>
                    <p>{formatDate(ticket.createdAt)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Recent orders" description="Latest customer orders">
          {vendor.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-3">Order</th>
                    <th className="pb-2 pr-3">Customer</th>
                    <th className="pb-2 pr-3">Status</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {vendor.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-3 font-medium">
                        {order.displayId ?? order.id.slice(0, 8)}
                      </td>
                      <td className="py-2.5 pr-3 text-muted-foreground">
                        {order.customerEmail ?? '—'}
                      </td>
                      <td className="py-2.5 pr-3">{order.status}</td>
                      <td className="py-2.5 text-right">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Payout history"
          description="Requests and manual release records (method, reference, admin)"
        >
          {vendor.payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payout requests.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-3">Requested</th>
                    <th className="pb-2 pr-3">Released</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 pr-3">Status</th>
                    <th className="pb-2 pr-3">Method</th>
                    <th className="pb-2 pr-3">Reference</th>
                    <th className="pb-2">Recorded by</th>
                  </tr>
                </thead>
                <tbody>
                  {vendor.payouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-3">{formatDate(payout.createdAt)}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground">
                        {payout.releasedAt ? formatDate(payout.releasedAt) : '—'}
                      </td>
                      <td className="py-2.5 text-right font-medium">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="py-2.5 pr-3">{payout.status}</td>
                      <td className="py-2.5 pr-3">{payoutMethodLabel(payout.paymentMethod)}</td>
                      <td
                        className="max-w-[120px] truncate py-2.5 pr-3 font-mono text-xs"
                        title={payout.transactionReference ?? ''}
                      >
                        {payout.transactionReference ?? '—'}
                      </td>
                      <td className="py-2.5 text-xs text-muted-foreground">
                        {payout.releasedByAdminEmail ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Admin activity" description="Actions taken on this vendor">
        {vendor.activityLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No admin activity logged.</p>
        ) : (
          <ul className="divide-y divide-border">
            {vendor.activityLogs.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.adminEmail ?? 'System'} · {formatDate(log.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
