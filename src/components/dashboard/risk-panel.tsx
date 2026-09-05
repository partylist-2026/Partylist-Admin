import type { AdminAnalyticsRisk } from '@/lib/api/analytics.types';
import { formatCurrency, formatPercent } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldAlert, Clock, Users } from 'lucide-react';

interface RiskPanelProps {
  risk: AdminAnalyticsRisk;
}

export function RiskPanel({ risk }: RiskPanelProps) {
  const totalFlags =
    risk.highRefundVendors.length +
    risk.highDisputeUsers.length +
    risk.vendorsWithLateSettlement.length +
    risk.suspiciousOrderClusters.length;

  return (
    <Card className="shadow-[0_1px_2px_rgba(11,19,32,0.04)]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold">Risk indicators</CardTitle>
          <CardDescription>From GET /admin/analytics/risk</CardDescription>
        </div>
        <Badge variant="outline">{totalFlags}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <RiskSection
          icon={AlertTriangle}
          label="High refund vendors"
          count={risk.highRefundVendors.length}
          emptyMessage="No records in API response."
        >
          {risk.highRefundVendors.map((item) => (
            <li key={item.vendorId} className="truncate text-xs text-muted-foreground">
              {item.storeName} · {formatPercent(item.refundRate)}
            </li>
          ))}
        </RiskSection>

        <RiskSection
          icon={Users}
          label="High dispute users"
          count={risk.highDisputeUsers.length}
          emptyMessage="No records in API response."
        >
          {risk.highDisputeUsers.map((item) => (
            <li key={item.userId} className="truncate text-xs text-muted-foreground">
              {item.email ?? item.userId} · {item.disputeCount} disputes
            </li>
          ))}
        </RiskSection>

        <RiskSection
          icon={Clock}
          label="Late settlements"
          count={risk.vendorsWithLateSettlement.length}
          emptyMessage="No records in API response."
        >
          {risk.vendorsWithLateSettlement.map((item) => (
            <li key={`${item.vendorId}-${item.orderId}`} className="truncate text-xs text-muted-foreground">
              {item.storeName} · order {item.orderId}
            </li>
          ))}
        </RiskSection>

        <RiskSection
          icon={ShieldAlert}
          label="Suspicious order clusters"
          count={risk.suspiciousOrderClusters.length}
          emptyMessage="No records in API response."
        >
          {risk.suspiciousOrderClusters.map((item) => (
            <li key={item.userId} className="truncate text-xs text-muted-foreground">
              User {item.userId} · {item.orderCount} orders ·{' '}
              {formatCurrency(item.totalAmount)}
            </li>
          ))}
        </RiskSection>
      </CardContent>
    </Card>
  );
}

function RiskSection({
  icon: Icon,
  label,
  count,
  emptyMessage,
  children,
}: {
  icon: typeof AlertTriangle;
  label: string;
  count: number;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
        <Badge variant="outline">{count}</Badge>
      </div>
      {count === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="space-y-1">{children}</ul>
      )}
    </div>
  );
}
