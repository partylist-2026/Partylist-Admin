'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
  Download,
  History,
  DollarSign,
  Mail,
  MessageSquareWarning,
  Package,
  Scale,
  User,
  Wallet,
} from 'lucide-react';
import type { AdminUserDetail, UserAuditEventKind } from '@/lib/api/users.types';
import { getUserDisplayName } from '@/lib/api/users.types';
import { formatCurrency, formatDate, formatNumber, formatRelativeTime } from '@/lib/format';
import { VendorMetricCard } from '@/components/vendors/vendor-metric-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ProfileTab =
  | 'audit'
  | 'orders'
  | 'disputes'
  | 'tickets'
  | 'wallet'
  | 'account';

const TABS: Array<{
  id: ProfileTab;
  label: string;
  icon: typeof History;
  count?: (user: AdminUserDetail) => number;
}> = [
  { id: 'audit', label: 'Audit Logs', icon: History, count: (u) => u.stats.auditLogCount },
  { id: 'orders', label: 'Order History', icon: Package, count: (u) => u.stats.totalOrders },
  { id: 'disputes', label: 'Disputes', icon: Scale, count: (u) => u.disputes.length },
  {
    id: 'tickets',
    label: 'Support Tickets',
    icon: MessageSquareWarning,
    count: (u) => u.supportTickets.length,
  },
  { id: 'wallet', label: 'Wallet & Transactions', icon: Wallet },
  { id: 'account', label: 'Account Details', icon: User },
];

function auditIconWrap(kind: UserAuditEventKind): string {
  switch (kind) {
    case 'PAYMENT':
      return 'bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]';
    case 'DISPUTE':
      return 'bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)]';
    case 'PROFILE_UPDATE':
      return 'bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-primary';
    case 'ACTIVITY':
      return 'bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)] text-destructive';
    case 'SUPPORT_TICKET':
      return 'bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]';
    case 'WALLET':
      return 'bg-secondary text-secondary-foreground';
    default:
      return 'bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-primary';
  }
}

function disputeStatusClass(status: string): string {
  if (status === 'OPEN') return 'metric-chip metric-chip-destructive';
  if (status === 'IN_REVIEW') return 'metric-chip metric-chip-warning';
  return 'metric-chip bg-muted text-muted-foreground';
}

function ticketStatusClass(status: string): string {
  if (status === 'OPEN' || status === 'IN_PROGRESS') return 'metric-chip metric-chip-warning';
  return 'metric-chip metric-chip-success';
}

interface UserDetailViewProps {
  user: AdminUserDetail;
}

export function UserDetailView({ user }: UserDetailViewProps) {
  const [tab, setTab] = useState<ProfileTab>('audit');
  const displayName = getUserDisplayName(user);

  const openDisputes = useMemo(
    () => user.disputes.filter((d) => d.status === 'OPEN' || d.status === 'IN_REVIEW'),
    [user.disputes]
  );

  const pendingTickets = useMemo(
    () =>
      user.supportTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS'),
    [user.supportTickets]
  );

  function exportAuditCsv() {
    const rows = [
      ['id', 'kind', 'title', 'description', 'createdAt'],
      ...user.auditLogs.map((e) => [
        e.id,
        e.kind,
        e.title,
        e.description ?? '',
        e.createdAt,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-${user.id}-audit.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dashboard-scroll space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/users"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Users
        </Link>
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground/80">Users</span>
          <span className="mx-1.5 text-muted-foreground">/</span>
          <span className="font-medium text-foreground">{displayName}</span>
          <span className="mx-1.5 text-muted-foreground">—</span>
          Profile Detail
        </p>
      </div>

      <div className="metrics-grid">
        <VendorMetricCard
          title="Total Orders"
          value={formatNumber(user.stats.totalOrders)}
          chip={
            user.stats.activeOrders > 0
              ? { label: `${user.stats.activeOrders} active orders`, tone: 'success' }
              : undefined
          }
          icon={Package}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] text-primary"
        />
        <VendorMetricCard
          title="Total Spend"
          value={formatCurrency(user.stats.totalSpend)}
          icon={DollarSign}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]"
        />
        <VendorMetricCard
          title="Open Disputes"
          value={formatNumber(user.stats.openDisputes)}
          chip={
            user.stats.openDisputes > 0
              ? { label: 'Awaiting resolution', tone: 'warning' }
              : undefined
          }
          icon={AlertTriangle}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)]"
        />
        <VendorMetricCard
          title="Open Tickets"
          value={formatNumber(user.stats.openTickets)}
          icon={Mail}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] text-destructive"
        />
      </div>

      <div className="admin-panel-card overflow-hidden">
        <nav className="user-profile-tabs overflow-x-auto px-4 pt-2 sm:px-5" aria-label="Profile sections">
          {TABS.map(({ id, label, icon: Icon, count }) => {
            const n = count?.(user);
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn('user-profile-tab shrink-0', tab === id && 'is-active')}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
                {n !== undefined && (
                  <span className="text-xs text-muted-foreground">({formatNumber(n)})</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 sm:p-5">
          {tab === 'audit' && (
            <div className="user-profile-detail-grid">
              <section className="admin-panel-card overflow-hidden">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Audit Logs</h2>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(user.auditLogs.length)} events
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={exportAuditCsv}
                    disabled={user.auditLogs.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </header>
                <div>
                  {user.auditLogs.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No activity recorded yet.
                    </p>
                  ) : (
                    user.auditLogs.map((event) => (
                      <article key={event.id} className="audit-log-item">
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]',
                            auditIconWrap(event.kind)
                          )}
                        >
                          <ClipboardList className="h-4 w-4" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{event.title}</p>
                          {event.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                        <time
                          className="shrink-0 text-xs text-muted-foreground"
                          dateTime={event.createdAt}
                        >
                          {formatRelativeTime(event.createdAt)}
                        </time>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <aside className="space-y-4">
                <WidgetDisputes disputes={openDisputes} onViewAll={() => setTab('disputes')} />
                <WidgetTickets tickets={pendingTickets} onViewAll={() => setTab('tickets')} />
              </aside>
            </div>
          )}

          {tab === 'orders' && (
            <section className="admin-panel-card overflow-hidden">
              <header className="border-b border-border px-5 py-4">
                <h2 className="text-base font-semibold text-foreground">Order History</h2>
              </header>
              <ul className="divide-y divide-border">
                {user.recentOrders.length === 0 ? (
                  <li className="px-5 py-8 text-center text-sm text-muted-foreground">No orders.</li>
                ) : (
                  user.recentOrders.map((order) => (
                    <li
                      key={order.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {order.displayId ?? order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.vendorName} · {formatDate(order.eventDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</p>
                        <span className="metric-chip bg-muted text-muted-foreground">{order.status}</span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </section>
          )}

          {tab === 'disputes' && (
            <section className="admin-panel-card overflow-hidden">
              <header className="border-b border-border px-5 py-4">
                <h2 className="text-base font-semibold text-foreground">Disputes</h2>
              </header>
              <ul className="divide-y divide-border">
                {user.disputes.length === 0 ? (
                  <li className="px-5 py-8 text-center text-sm text-muted-foreground">No disputes.</li>
                ) : (
                  user.disputes.map((d) => (
                    <li key={d.id} className="space-y-2 px-5 py-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          #{d.id.slice(0, 8).toUpperCase()}{' '}
                          <span className="font-normal text-muted-foreground">
                            {d.orderDisplayId ?? d.orderId.slice(0, 8)}
                          </span>
                        </p>
                        <span className={disputeStatusClass(d.status)}>{d.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm text-foreground">{d.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.vendorName} · {formatRelativeTime(d.createdAt)}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </section>
          )}

          {tab === 'tickets' && (
            <section className="admin-panel-card overflow-hidden">
              <header className="border-b border-border px-5 py-4">
                <h2 className="text-base font-semibold text-foreground">Support Tickets</h2>
              </header>
              <ul className="divide-y divide-border">
                {user.supportTickets.length === 0 ? (
                  <li className="px-5 py-8 text-center text-sm text-muted-foreground">No tickets.</li>
                ) : (
                  user.supportTickets.map((t) => (
                    <li key={t.id} className="flex items-start justify-between gap-3 px-5 py-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">#{t.id.slice(0, 8)}</p>
                        <p className="mt-0.5 truncate text-sm text-foreground">{t.subject}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t.priority} · {formatRelativeTime(t.createdAt)}
                        </p>
                      </div>
                      <span className={ticketStatusClass(t.status)}>{t.status.replace('_', ' ')}</span>
                    </li>
                  ))
                )}
              </ul>
            </section>
          )}

          {tab === 'wallet' && (
            <div className="space-y-4">
              <div className="admin-panel-card p-5">
                <p className="text-sm text-muted-foreground">Wallet balance</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {formatCurrency(user.stats.walletBalance)}
                </p>
              </div>
              <section className="admin-panel-card overflow-hidden">
                <header className="border-b border-border px-5 py-4">
                  <h2 className="text-base font-semibold text-foreground">Transactions</h2>
                </header>
                <ul className="divide-y divide-border">
                  {user.walletTransactions.length === 0 ? (
                    <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No wallet activity.
                    </li>
                  ) : (
                    user.walletTransactions.map((tx) => (
                      <li
                        key={tx.id}
                        className="flex items-center justify-between gap-3 px-5 py-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {tx.type} · {tx.source}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.reason ?? tx.description ?? '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              'text-sm font-semibold',
                              tx.type === 'CREDIT' ? 'text-[var(--success)]' : 'text-destructive'
                            )}
                          >
                            {tx.type === 'CREDIT' ? '+' : '−'}
                            {formatCurrency(tx.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(tx.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </section>
            </div>
          )}

          {tab === 'account' && (
            <section className="admin-panel-card overflow-hidden">
              <header className="border-b border-border px-5 py-4">
                <h2 className="text-base font-semibold text-foreground">Account Details</h2>
              </header>
              <dl className="grid gap-4 px-5 py-5 sm:grid-cols-2">
                <AccountField label="Full name" value={displayName} />
                <AccountField label="Email" value={user.email ?? '—'} />
                <AccountField label="Phone" value={user.phone ?? '—'} />
                <AccountField label="Status" value={user.status} />
                <AccountField label="User ID" value={user.id} mono />
                <AccountField label="Firebase UID" value="—" />
                <AccountField label="Joined" value={formatDate(user.createdAt)} />
                <AccountField
                  label="Last seen"
                  value={user.lastSeenAt ? formatRelativeTime(user.lastSeenAt) : '—'}
                />
                <AccountField label="Wallet balance" value={formatCurrency(user.stats.walletBalance)} />
              </dl>
              {user.addresses.length > 0 && (
                <div className="border-t border-border px-5 py-5">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Saved addresses</h3>
                  <ul className="space-y-3">
                    {user.addresses.map((addr) => (
                      <li
                        key={addr.id}
                        className="rounded-[var(--radius-md)] border border-border px-4 py-3 text-sm"
                      >
                        <p className="font-medium text-foreground">
                          {addr.label}
                          {addr.isDefault && (
                            <span className="ml-2 metric-chip metric-chip-success">Default</span>
                          )}
                        </p>
                        <p className="mt-0.5 text-muted-foreground">
                          {addr.line1}, {addr.city}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function AccountField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className={cn('mt-0.5 text-sm text-foreground', mono && 'font-mono text-xs break-all')}>
        {value}
      </dd>
    </div>
  );
}

function WidgetDisputes({
  disputes,
  onViewAll,
}: {
  disputes: AdminUserDetail['disputes'];
  onViewAll: () => void;
}) {
  return (
    <section className="admin-panel-card overflow-hidden">
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Disputes</h3>
          {disputes.length > 0 && (
            <span className="metric-chip metric-chip-destructive">{disputes.length} Open</span>
          )}
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          View All
        </button>
      </header>
      <ul className="divide-y divide-border">
        {disputes.length === 0 ? (
          <li className="px-4 py-6 text-center text-xs text-muted-foreground">No open disputes.</li>
        ) : (
          disputes.slice(0, 3).map((d) => (
            <li key={d.id} className="space-y-1.5 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">
                  #{d.id.slice(0, 8).toUpperCase()}
                </p>
                <span className={disputeStatusClass(d.status)}>{d.status.replace('_', ' ')}</span>
              </div>
              <p className="line-clamp-2 text-xs text-foreground">{d.reason}</p>
              <p className="text-[11px] text-muted-foreground">{formatRelativeTime(d.createdAt)}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function WidgetTickets({
  tickets,
  onViewAll,
}: {
  tickets: AdminUserDetail['supportTickets'];
  onViewAll: () => void;
}) {
  return (
    <section className="admin-panel-card overflow-hidden">
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Support Tickets</h3>
          {tickets.length > 0 && (
            <span className="metric-chip metric-chip-warning">{tickets.length} Pending</span>
          )}
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          View All
        </button>
      </header>
      <ul className="divide-y divide-border">
        {tickets.length === 0 ? (
          <li className="px-4 py-6 text-center text-xs text-muted-foreground">No pending tickets.</li>
        ) : (
          tickets.slice(0, 3).map((t) => (
            <li key={t.id} className="space-y-1.5 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">#{t.id.slice(0, 8)}</p>
                <span className={ticketStatusClass(t.status)}>{t.status.replace('_', ' ')}</span>
              </div>
              <p className="line-clamp-2 text-xs text-foreground">{t.subject}</p>
              <p className="text-[11px] text-muted-foreground">{formatRelativeTime(t.createdAt)}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
