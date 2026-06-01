import type { AdminAnalyticsOrderTrends } from '@/lib/api/analytics.types';
import { formatCurrency, formatNumber } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-success',
  SETTLED: 'bg-primary',
  IN_PROGRESS: 'bg-accent',
  PAID: 'bg-[color-mix(in_srgb,var(--primary)_70%,white)]',
  CANCELLED: 'bg-destructive',
  REFUNDED: 'bg-warning',
};

interface OrderBreakdownCardProps {
  data: AdminAnalyticsOrderTrends;
}

export function OrderBreakdownCard({ data }: OrderBreakdownCardProps) {
  const entries = Object.entries(data.statusBreakdown).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...entries.map(([, c]) => c), 1);

  return (
    <Card className="shadow-[0_1px_2px_rgba(11,19,32,0.04)]">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Order pipeline</CardTitle>
        <CardDescription>From GET /admin/analytics/order-trends</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[var(--radius-lg)] border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Total orders</p>
            <p className="mt-1 text-xl font-semibold">{formatNumber(data.totalOrders)}</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Avg order value</p>
            <p className="mt-1 text-xl font-semibold">{formatCurrency(data.avgOrderValue)}</p>
          </div>
        </div>

        <div className="space-y-3">
          {entries.map(([status, count]) => (
            <div key={status} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium capitalize text-foreground">
                  {status.replace(/_/g, ' ').toLowerCase()}
                </span>
                <span className="text-muted-foreground">{formatNumber(count)}</span>
              </div>
              <Progress
                value={count}
                max={maxCount}
                indicatorClassName={STATUS_COLORS[status] ?? 'bg-primary'}
              />
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Avg settlement time:{' '}
          <span className="font-medium text-foreground">
            {data.avgSettlementTimeHours.toFixed(1)}h
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
