import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  detail?: string;
  icon: LucideIcon;
  iconClassName?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  detail,
  icon: Icon,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden rounded-[var(--radius-md)] shadow-[0_1px_2px_rgba(11,19,32,0.04)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="metric-value text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
            {subtitle && (
              <p className="metric-trend text-xs text-muted-foreground">{subtitle}</p>
            )}
            {detail && (
              <p className="metric-trend text-xs font-medium text-muted-foreground">{detail}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary text-secondary-foreground',
              iconClassName
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
