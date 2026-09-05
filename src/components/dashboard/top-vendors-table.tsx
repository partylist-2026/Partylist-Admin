import type { AdminAnalyticsVendorPerformance } from '@/lib/api/analytics.types';
import { formatCurrency, formatNumber, formatPercent, getInitials } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TopVendorsTableProps {
  vendors: AdminAnalyticsVendorPerformance[];
}

export function TopVendorsTable({ vendors }: TopVendorsTableProps) {
  return (
    <Card className="shadow-[0_1px_2px_rgba(11,19,32,0.04)]">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Top vendors</CardTitle>
        <CardDescription>From GET /admin/analytics/vendors</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Rating</TableHead>
              <TableHead className="text-right">Refund rate</TableHead>
              <TableHead className="text-right">Dispute rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.vendorId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      {getInitials(vendor.storeName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{vendor.storeName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Settlement {formatPercent(vendor.settlementRate)} · Payout{' '}
                        {formatPercent(vendor.payoutRatio)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(vendor.totalRevenue)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatNumber(vendor.totalOrders)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {vendor.avgRating.toFixed(1)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatPercent(vendor.refundRate)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatPercent(vendor.disputeRate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
