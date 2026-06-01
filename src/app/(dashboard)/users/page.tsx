import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { listUsers } from '@/lib/api/users';
import { formatCurrency, formatNumber } from '@/lib/format';
import { VendorMetricCard } from '@/components/vendors/vendor-metric-card';
import { UsersTable } from '@/components/users/users-table';

export const metadata: Metadata = {
  title: 'Users',
};

interface UsersPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const search = params.search?.trim() ?? '';

  const listData = await listUsers({ page, limit: 20, search: search || undefined }).catch(
    () => ({
      users: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    })
  );

  const totalSpend = listData.users.reduce((sum, u) => sum + u.totalSpend, 0);
  const totalOrders = listData.users.reduce((sum, u) => sum + u.totalOrders, 0);

  return (
    <div className="dashboard-scroll space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage customer accounts, orders, and support history.
        </p>
      </div>

      <div className="metrics-grid">
        <VendorMetricCard
          title="Total users"
          value={formatNumber(listData.pagination.total)}
          icon={Users}
        />
        <VendorMetricCard
          title="On this page"
          value={formatNumber(listData.users.length)}
          icon={Users}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-primary"
        />
        <VendorMetricCard
          title="Orders (page)"
          value={formatNumber(totalOrders)}
          icon={Users}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--warning)_15%,transparent)] text-[var(--warning)]"
        />
        <VendorMetricCard
          title="Spend (page)"
          value={formatCurrency(totalSpend)}
          icon={Users}
          iconWrapClassName="bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]"
        />
      </div>

      <UsersTable
        users={listData.users}
        pagination={listData.pagination}
        initialSearch={search}
      />
    </div>
  );
}
