import { ChevronDown } from 'lucide-react';
import type { AdminAnalyticsVendorPerformance } from '@/lib/api/analytics.types';
import { formatPercent } from '@/lib/format';

interface VendorPerformanceChartProps {
  vendors: AdminAnalyticsVendorPerformance[];
}

export function VendorPerformanceChart({ vendors }: VendorPerformanceChartProps) {
  const maxSettlement = Math.max(...vendors.map((v) => v.settlementRate), 0.01);

  return (
    <article className="admin-panel-card flex h-full flex-col">
      <header className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Vendor performance</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Settlement rate and dispute ratio by top revenue vendors
          </p>
        </div>
        <div className="relative w-full sm:w-auto">
          <select
            className="h-9 w-full appearance-none rounded-[var(--radius-md)] border border-border bg-input pl-3 pr-8 text-xs font-medium text-foreground sm:w-[140px]"
            defaultValue="90d"
            disabled
            aria-label="Performance period"
          >
            <option value="90d">Last 90 days</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col px-5 py-5">
        {vendors.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            No vendor performance data returned.
          </p>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm chart-bar-gradient" aria-hidden />
                Settlement rate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm bg-[var(--destructive-soft)]"
                  aria-hidden
                />
                Dispute ratio
              </span>
            </div>
            <div className="flex min-h-[14rem] flex-1 items-end justify-between gap-2 sm:gap-3">
              {vendors.map((vendor) => {
                const settlementPct = (vendor.settlementRate / maxSettlement) * 100;
                const disputePct = Math.min(vendor.disputeRate * 100, 100);

                return (
                  <div
                    key={vendor.vendorId}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <div className="relative flex h-44 w-full items-end justify-center gap-1">
                      <div
                        className="chart-bar-gradient w-full max-w-[22px] rounded-t-[var(--radius-sm)]"
                        style={{ height: `${Math.max(settlementPct, 6)}%` }}
                        title={`Settlement ${formatPercent(vendor.settlementRate)}`}
                      />
                      <div
                        className="w-full max-w-[10px] rounded-t-[var(--radius-sm)] bg-[var(--destructive-soft)]"
                        style={{ height: `${Math.max(disputePct, 4)}%` }}
                        title={`Disputes ${formatPercent(vendor.disputeRate)}`}
                      />
                    </div>
                    <div className="w-full text-center">
                      <p className="truncate text-[11px] font-medium text-foreground">
                        {vendor.storeName}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {formatPercent(vendor.settlementRate)} settled
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
