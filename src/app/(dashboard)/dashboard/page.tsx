import type { Metadata } from 'next';
import { getDashboardOverviewData } from '@/lib/api/analytics';
import { getSession } from '@/lib/auth/session';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const session = await getSession();
  const data = await getDashboardOverviewData();

  return (
    <DashboardOverview data={data} adminEmail={session?.user.email} />
  );
}
