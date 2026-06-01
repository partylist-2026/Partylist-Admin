import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminTopHeader } from '@/components/layout/admin-top-header';
import { getSession } from '@/lib/auth/session';
import { getOrderTrends } from '@/lib/api/analytics';
import { redirect } from 'next/navigation';

const ACTIVE_ORDER_STATUSES = [
  'CREATED',
  'PAYMENT_PENDING',
  'PAID',
  'PENDING_VENDOR_ACCEPTANCE',
  'ACCEPTED',
  'IN_PROGRESS',
  'REFUND_PENDING',
] as const;

function countActiveOrders(
  statusBreakdown: Record<string, number> | undefined
): number | undefined {
  if (!statusBreakdown) return undefined;
  return ACTIVE_ORDER_STATUSES.reduce(
    (sum, status) => sum + (statusBreakdown[status] ?? 0),
    0
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  let ordersBadgeCount: number | undefined;
  try {
    const orderTrends = await getOrderTrends();
    ordersBadgeCount = countActiveOrders(orderTrends.statusBreakdown);
  } catch {
    ordersBadgeCount = undefined;
  }

  return (
    <div className="admin-viewport">
      <div className="admin-layout">
        <div className="hidden lg:flex">
          <AdminSidebar ordersBadgeCount={ordersBadgeCount} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopHeader email={session.user.email} />
          <main className="dashboard-scroll flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
