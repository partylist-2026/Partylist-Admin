import type { AdminAnalyticsRevenueTrend } from '@/lib/api/analytics.types';
import { formatCompactNumber } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueChartProps {
  data: AdminAnalyticsRevenueTrend;
}

function buildPath(values: number[], width: number, height: number, padding = 8): string {
  if (values.length === 0) return '';
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / Math.max(values.length - 1, 1);

  return values
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function buildArea(values: number[], width: number, height: number, padding = 8): string {
  const line = buildPath(values, width, height, padding);
  if (!line) return '';
  const lastX = width - padding;
  const baseY = height - padding;
  return `${line} L ${lastX} ${baseY} L ${padding} ${baseY} Z`;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { labels, grossRevenueSeries, netRevenueSeries } = data;

  if (labels.length === 0) {
    return (
      <Card className="shadow-[0_1px_2px_rgba(11,19,32,0.04)]">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revenue trend</CardTitle>
          <CardDescription>No revenue trend labels returned by the API.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const width = 640;
  const height = 220;
  const padding = 12;
  const gross = grossRevenueSeries;
  const net = netRevenueSeries;
  const lastLabel = labels[labels.length - 1];
  const lastNet = net[net.length - 1] ?? 0;

  return (
    <Card className="shadow-[0_1px_2px_rgba(11,19,32,0.04)]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Revenue trend</CardTitle>
          <CardDescription>Daily gross vs net revenue from API series</CardDescription>
        </div>
        {lastLabel && (
          <div className="text-right">
            <p className="text-lg font-semibold text-foreground">
              {formatCompactNumber(lastNet)}
            </p>
            <p className="text-xs text-muted-foreground">Net · {lastLabel}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
            <span>Gross revenue series</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
            <span>Net revenue series</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-[220px] w-full min-w-[320px]"
            role="img"
            aria-label="Revenue trend chart"
          >
            <defs>
              <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line
                key={ratio}
                x1={padding}
                x2={width - padding}
                y1={padding + ratio * (height - padding * 2)}
                y2={padding + ratio * (height - padding * 2)}
                stroke="var(--border)"
                strokeWidth="1"
              />
            ))}
            {net.length > 0 && (
              <path d={buildArea(net, width, height, padding)} fill="url(#netFill)" />
            )}
            {gross.length > 0 && (
              <path
                d={buildPath(gross, width, height, padding)}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {net.length > 0 && (
              <path
                d={buildPath(net, width, height, padding)}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </div>

        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>{labels[0]}</span>
          <span>{labels[Math.floor(labels.length / 2)]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      </CardContent>
    </Card>
  );
}
